import base64
import hashlib
import secrets
from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from .db import execute_query
from .models import User, Token

security = HTTPBasic()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

async def get_current_user(credentials: Annotated[HTTPBasicCredentials, Depends(security)]) -> User:
    query = "SELECT * FROM users WHERE username = %s"
    rows = await execute_query(query, (credentials.username,))
    
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    
    user_data = rows[0]
    user = User(**user_data)
    
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    
    return user

def create_basic_auth_token(username: str, password: str) -> str:
    user_pass = f"{username}:{password}"
    return base64.b64encode(user_pass.encode()).decode()
