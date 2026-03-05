from sqlalchemy import Column, Integer, String, Boolean, Sequence, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

# Pivot table for User-Role relationship
model_has_roles = Table(
    'model_has_roles',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete="CASCADE"), primary_key=True),
    Column('role_id', Integer, ForeignKey('roles.id', ondelete="CASCADE"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, Sequence('users_id_seq'), primary_key=True)
    username = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)

    # Relationships
    roles = relationship("Role", secondary=model_has_roles, back_populates="users")
