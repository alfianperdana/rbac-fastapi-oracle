from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.permission import Permission
from app.schemas.all import Permission as PermissionSchema, PermissionCreate
from app.api.dependencies import require_permission

router = APIRouter()

@router.get("/", response_model=List[PermissionSchema])
def read_permissions(db: Session = Depends(get_db), _ = Depends(require_permission("permission.view"))):
    permissions = db.query(Permission).all()
    return permissions

@router.post("/", response_model=PermissionSchema)
def create_permission(perm_in: PermissionCreate, db: Session = Depends(get_db), _ = Depends(require_permission("permission.create"))):
    db_perm = db.query(Permission).filter(Permission.name == perm_in.name).first()
    if db_perm:
        raise HTTPException(status_code=400, detail="Permission already exists")
        
    new_perm = Permission(name=perm_in.name, description=perm_in.description)
    db.add(new_perm)
    db.commit()
    db.refresh(new_perm)
    return new_perm

@router.delete("/{perm_id}")
def delete_permission(perm_id: int, db: Session = Depends(get_db), _ = Depends(require_permission("permission.delete"))):
    perm = db.query(Permission).filter(Permission.id == perm_id).first()
    if not perm:
        raise HTTPException(status_code=404, detail="Permission not found")
    db.delete(perm)
    db.commit()
    return {"message": "Permission deleted successfully"}
