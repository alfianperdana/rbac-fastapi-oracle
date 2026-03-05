from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.config import settings
from app.db.database import get_db
from app.models.user import User
from app.models.role import Role
from app.schemas.all import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
        
    # Get user with roles and permissions eager loaded if necessary
    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user

def require_permission(required_permission: str):
    """
    Advanced RBAC Dependency Checker Factory (Spatie-like).
    Checks if the user's roles contain the required permission.
    """
    def permission_checker(current_user: User = Depends(get_current_user)):
        # If user is superadmin, maybe bypass? We'll assume explicit is better.
        has_permission = False
        
        # Check permissions through assigned roles
        for role in current_user.roles:
            for perm in role.permissions:
                if perm.name == required_permission:
                    has_permission = True
                    break
            if has_permission:
                break
                
        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Not enough permissions. Required: {required_permission}"
            )
        return current_user
        
    return permission_checker

def require_any_permission(required_permissions: list):
    """
    Checks if the user has AT LEAST ONE of the required permissions.
    """
    def permission_checker(current_user: User = Depends(get_current_user)):
        has_permission = False
        
        for role in current_user.roles:
            for perm in role.permissions:
                if perm.name in required_permissions:
                    has_permission = True
                    break
            if has_permission:
                break
                
        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Not enough permissions. Required one of: {', '.join(required_permissions)}"
            )
        return current_user
        
    return permission_checker
