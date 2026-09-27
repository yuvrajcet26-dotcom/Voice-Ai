import hmac
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Union
import jwt
from app.core.config import settings

SECRET_SALT = "svkm_global_university_dhule_salt_2026"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the stored salted hash."""
    hashed_input = hash_password(plain_password)
    return hmac.compare_digest(hashed_input, hashed_password)

def hash_password(password: str) -> str:
    """Generate SHA256 salted hash for password."""
    salted = f"{SECRET_SALT}:{password}".encode("utf-8")
    return hashlib.sha256(salted).hexdigest()

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None, extra_claims: Optional[dict] = None) -> str:
    """Create a signed JWT access token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    if extra_claims:
        to_encode.update(extra_claims)
        
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
