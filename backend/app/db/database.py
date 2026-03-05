import oracledb
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Initialize oracledb thick client if necessary, or just use thin mode (default in v2)
# oracledb.init_oracle_client() # Uncomment if you need thick mode and have instant client installed.

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    max_identifier_length=128 # Oracle 12.2+ supports 128 bytes identifiers
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
