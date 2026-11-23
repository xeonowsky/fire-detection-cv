from collections.abc import Iterator

from sqlmodel import Session, SQLModel, create_engine

from app.config import settings

# check_same_thread=False: SQLite domyślnie blokuje użycie połączenia z innego wątku,
# a FastAPI i zadania w tle działają w puli wątków.
engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)


def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session
