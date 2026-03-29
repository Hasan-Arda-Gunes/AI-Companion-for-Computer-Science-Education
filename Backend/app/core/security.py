"""
Security utilities for authentication and authorization
"""
from datetime import datetime, timedelta
from typing import Optional
import hashlib

import bcrypt
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login")


# Marker for new hash format using SHA-256 prehash + bcrypt.
BCRYPT_SHA256_PREFIX = "sha256_bcrypt$"


def _password_digest(password: str) -> bytes:
    """Pre-hash UTF-8 password to avoid bcrypt's 72-byte input limitation."""
    return hashlib.sha256(password.encode("utf-8")).digest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against new format or legacy bcrypt hashes."""
    try:
        if hashed_password.startswith(BCRYPT_SHA256_PREFIX):
            bcrypt_hash = hashed_password[len(BCRYPT_SHA256_PREFIX):].encode("utf-8")
            return bcrypt.checkpw(_password_digest(plain_password), bcrypt_hash)

        # Legacy support for existing $2a/$2b/$2y bcrypt hashes.
        if hashed_password.startswith("$2"):
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

        return False
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Hash password with SHA-256 prehash + bcrypt."""
    bcrypt_hash = bcrypt.hashpw(_password_digest(password), bcrypt.gensalt()).decode("utf-8")
    return f"{BCRYPT_SHA256_PREFIX}{bcrypt_hash}"


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """Decode and verify a JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_id(token: str = Depends(oauth2_scheme)) -> int:
    """Get current user ID from JWT token"""
    payload = decode_access_token(token)
    user_id: int = payload.get("sub")
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return int(user_id)
