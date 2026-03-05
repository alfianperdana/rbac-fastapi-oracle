from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.role import Role
from app.models.permission import Permission
from app.schemas.all import Role as RoleSchema, RoleCreate, RoleAssignPermissions
from app.api.dependencies import require_permission

router = APIRouter()

@router.get("/", response_model=List[RoleSchema])
def read_roles(db: Session = Depends(get_db), _ = Depends(require_permission("role.view"))):
    roles = db.query(Role).all()
    return roles

@router.post("/", response_model=RoleSchema)
def create_role(role_in: RoleCreate, db: Session = Depends(get_db), _ = Depends(require_permission("role.create"))):
    db_role = db.query(Role).filter(Role.name == role_in.name).first()
    if db_role:
        raise HTTPException(status_code=400, detail="Role already exists")
        
    new_role = Role(name=role_in.name, description=role_in.description)
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    return new_role

@router.delete("/{role_id}")
def delete_role(role_id: int, db: Session = Depends(get_db), _ = Depends(require_permission("role.delete"))):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    db.delete(role)
    db.commit()
    return {"message": "Role deleted successfully"}

@router.post("/{role_id}/permissions", response_model=RoleSchema)
def assign_permissions_to_role(
    role_id: int, 
    perm_in: RoleAssignPermissions, 
    db: Session = Depends(get_db), 
    _ = Depends(require_permission("role.assign_permissions"))
):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Get permissions
    permissions = db.query(Permission).filter(Permission.id.in_(perm_in.permission_ids)).all()
    if len(permissions) != len(perm_in.permission_ids):
        raise HTTPException(status_code=400, detail="Some permissions were not found")
        
    # Replace existing permissions
    role.permissions = permissions
    db.commit()
    db.refresh(role)
    return role
