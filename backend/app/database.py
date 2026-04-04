import os
from dotenv import load_dotenv
from sqlmodel import Session, create_engine, SQLModel
from sqlalchemy import text

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./dev.db')
engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})


def ensure_sqlite_column(table_name: str, column_name: str, create_sql: str):
    if DATABASE_URL.startswith('sqlite'):
        with engine.connect() as conn:
            result = conn.execute(text(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}'"))
            if result.first() is None:
                return
            result = conn.execute(text(f"PRAGMA table_info('{table_name}')"))
            columns = [row[1] for row in result.fetchall()]
            if column_name not in columns:
                conn.execute(text(create_sql))
                conn.commit()


SQLModel.metadata.create_all(engine)
ensure_sqlite_column('task', 'assignee_id', 'ALTER TABLE task ADD COLUMN assignee_id INTEGER')
ensure_sqlite_column('user', 'password', 'ALTER TABLE user ADD COLUMN password TEXT')


def get_session():
    with Session(engine) as session:
        yield session
