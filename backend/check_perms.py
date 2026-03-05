from app.db.database import SessionLocal
from app.models.user import User

db = SessionLocal()
users = db.query(User).all()

for u in users:
    roles = [r.name for r in u.roles]
    perms = []
    for r in u.roles:
        perms.extend([p.name for p in r.permissions])
    print(f"User {u.id} ({u.username}): Roles={roles}, Permissions={perms}")

db.close()
