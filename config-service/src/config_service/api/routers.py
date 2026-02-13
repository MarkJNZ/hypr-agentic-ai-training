from typing import List
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from pydantic_extra_types.ulid import ULID
import httpx
import ulid

from ..config import settings
from ..db import execute_query
from ..models import (
    Application, ApplicationCreate, ApplicationUpdate,
    Configuration, ConfigurationCreate, ConfigurationUpdate,
    User
)
from ..auth import get_current_user, create_jwt


router = APIRouter()

# --- Auth Endpoints (mounted at /auth by main.py) ---

auth_router = APIRouter()


@auth_router.get("/login")
async def auth_login():
    """Redirect to GitHub OAuth authorization page."""
    github_auth_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={settings.github_client_id}"
        f"&scope=read:user user:email"
    )
    return RedirectResponse(url=github_auth_url)


@auth_router.get("/callback")
async def auth_callback(code: str = Query(...)):
    """Handle GitHub OAuth callback — exchange code for token, upsert user, issue JWT."""

    # Exchange the authorization code for an access token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            json={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
            },
            headers={"Accept": "application/json"},
        )

    token_data = token_response.json()
    access_token = token_data.get("access_token")

    if not access_token:
        error = token_data.get("error_description", "Failed to get access token")
        raise HTTPException(status_code=400, detail=error)

    # Fetch user profile from GitHub
    async with httpx.AsyncClient() as client:
        user_response = await client.get(
            "https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
            },
        )

    if user_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to fetch GitHub user profile")

    github_user = user_response.json()
    github_id = github_user["id"]
    username = github_user["login"]
    avatar_url = github_user.get("avatar_url")
    email = github_user.get("email")

    # Try to get email from emails endpoint if not public
    if not email:
        async with httpx.AsyncClient() as client:
            emails_response = await client.get(
                "https://api.github.com/user/emails",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json",
                },
            )
        if emails_response.status_code == 200:
            emails = emails_response.json()
            primary_emails = [e for e in emails if e.get("primary")]
            if primary_emails:
                email = primary_emails[0]["email"]

    # Upsert user in database
    upsert_query = """
    INSERT INTO users (username, github_id, avatar_url, email)
    VALUES (%s, %s, %s, %s)
    ON CONFLICT (github_id)
    DO UPDATE SET username = EXCLUDED.username,
                  avatar_url = EXCLUDED.avatar_url,
                  email = EXCLUDED.email
    RETURNING *
    """
    await execute_query(upsert_query, (username, github_id, avatar_url, email))

    # Create JWT
    jwt_token = create_jwt(github_id, username)

    # Redirect back to UI with token
    redirect_url = f"{settings.ui_url}/#auth/callback?token={jwt_token}"
    return RedirectResponse(url=redirect_url)


@auth_router.get("/me")
async def auth_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's info."""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "github_id": current_user.github_id,
        "avatar_url": current_user.avatar_url,
        "email": current_user.email,
    }


# --- Applications Endpoints ---

@router.post("/applications", response_model=Application)
async def create_application(app: ApplicationCreate, current_user: User = Depends(get_current_user)):

    app_id = ulid.ULID()
    query = "INSERT INTO applications (id, name, comments) VALUES (%s, %s, %s) RETURNING id"
    await execute_query(query, (str(app_id), app.name, app.comments))
    return Application(id=str(app_id), **app.model_dump())

@router.get("/applications/{id}", response_model=Application)
async def get_application(id: str, current_user: User = Depends(get_current_user)):
    query = "SELECT * FROM applications WHERE id = %s"
    rows = await execute_query(query, (id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Get related configuration IDs
    config_query = "SELECT id FROM configurations WHERE application_id = %s"
    configs = await execute_query(config_query, (id,))
    config_ids = [row["id"] for row in configs]
    
    return Application(**rows[0], configuration_ids=config_ids)

@router.get("/applications", response_model=List[Application])
async def list_applications(current_user: User = Depends(get_current_user)):
    query = "SELECT * FROM applications"
    rows = await execute_query(query)
    # Note: In a real app we'd likely want to join or batch fetch config IDs
    results = []
    for row in rows:
        results.append(Application(**row, configuration_ids=[]))
    return results

@router.put("/applications/{id}", response_model=Application)
async def update_application(id: str, app: ApplicationUpdate, current_user: User = Depends(get_current_user)):
    query = "UPDATE applications SET name = COALESCE(%s, name), comments = COALESCE(%s, comments) WHERE id = %s RETURNING *"
    rows = await execute_query(query, (app.name, app.comments, id))
    if not rows:
        raise HTTPException(status_code=404, detail="Application not found")
    return Application(**rows[0], configuration_ids=[])

@router.delete("/applications/{id}", status_code=204)
async def delete_application(id: str, current_user: User = Depends(get_current_user)):
    query = """
    WITH deleted_configs AS (
        DELETE FROM configurations WHERE application_id = %s
    )
    DELETE FROM applications WHERE id = %s RETURNING id
    """
    rows = await execute_query(query, (id, id))
    if not rows:
        raise HTTPException(status_code=404, detail="Application not found")
    return

# --- Configurations Endpoints ---

@router.post("/configurations", response_model=Configuration)
async def create_configuration(config: ConfigurationCreate, current_user: User = Depends(get_current_user)):
    config_id = ulid.ULID()
    query = """
    INSERT INTO configurations (id, application_id, name, comments, config)
    VALUES (%s, %s, %s, %s, %s)
    RETURNING *
    """
    from json import dumps
    try:
        await execute_query(query, (str(config_id), str(config.application_id), config.name, config.comments, dumps(config.config)))
    except Exception as e:
        # Check for unique constraint or foreign key errors
        raise HTTPException(status_code=400, detail=str(e))
    return Configuration(id=str(config_id), **config.model_dump())

@router.get("/configurations/{id}", response_model=Configuration)
async def get_configuration(id: str, current_user: User = Depends(get_current_user)):
    query = "SELECT * FROM configurations WHERE id = %s"
    rows = await execute_query(query, (id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return Configuration(**rows[0])

@router.put("/configurations/{id}", response_model=Configuration)
async def update_configuration(id: str, config: ConfigurationUpdate, current_user: User = Depends(get_current_user)):
    from json import dumps
    query = """
    UPDATE configurations 
    SET name = COALESCE(%s, name), 
    comments = COALESCE(%s, comments),
    config = COALESCE(%s, config)
    WHERE id = %s
    RETURNING *
    """
    config_json = dumps(config.config) if config.config is not None else None
    rows = await execute_query(query, (config.name, config.comments, config_json, id))
    if not rows:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return Configuration(**rows[0])

@router.delete("/configurations/{id}", status_code=204, response_model=None)
async def delete_configuration(id: str, current_user: User = Depends(get_current_user)):
    query = "DELETE FROM configurations WHERE id = %s RETURNING id"
    rows = await execute_query(query, (id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Configuration not found")
    return
