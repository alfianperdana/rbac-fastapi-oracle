from sqlalchemy import Column, Integer, String, Sequence
from sqlalchemy.orm import relationship
from app.db.database import Base

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, Sequence('permissions_id_seq'), primary_key=True)
    name = Column(String(255), unique=True, index=True, nullable=False) # e.g., 'user.create'
    description = Column(String(255), nullable=True)

    # Relationships
    roles = relationship("Role", secondary="role_has_permissions", back_populates="permissions")
