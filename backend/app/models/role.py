from sqlalchemy import Column, Integer, String, Sequence, Table, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.db.database import Base

# Pivot table for Role-Permission relationship
role_has_permissions = Table(
    'role_has_permissions',
    Base.metadata,
    Column('role_id', Integer, ForeignKey('roles.id', ondelete="CASCADE"), primary_key=True),
    Column('permission_id', Integer, ForeignKey('permissions.id', ondelete="CASCADE"), primary_key=True)
)

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, Sequence('roles_id_seq'), primary_key=True)
    name = Column(String(255), unique=True, index=True, nullable=False) # e.g., 'admin', 'supervisor', 'worker'
    description = Column(String(255), nullable=True)

    __table_args__ = (
        CheckConstraint(name.in_(['admin', 'supervisor', 'worker']), name='check_valid_role_names'),
    )

    # Relationships
    permissions = relationship("Permission", secondary=role_has_permissions, back_populates="roles")
    users = relationship("User", secondary="model_has_roles", back_populates="roles")
