from typing import List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from pydantic_extra_types.ulid import ULID
import ulid

from ..db import execute_query
from ..models import (
    Application, ApplicationCreate, ApplicationUpdate,
    Configuration, ConfigurationCreate, ConfigurationUpdate,
    User, Token
)
from ..auth import create_basic_auth_token, get_current_user, verify_password, get_password_hash




router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login", response_model=Token)
async def login(login_request: LoginRequest):
    # We verify against the DB
    query = "SELECT * FROM users WHERE username = %s"
    rows = await execute_query(query, (login_request.username,))
    
    if not rows:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    user_data = rows[0]
    # In a real app, use the verify_password from auth which hashes
    # Here just calling verify_password
    if not verify_password(login_request.password, user_data["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    token = create_basic_auth_token(login_request.username, login_request.password)
    return Token(token=token)

# Applications Endpoints

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

# Configurations Endpoints

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
