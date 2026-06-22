from __future__ import annotations

import argparse
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL, make_url

from app.core.config import settings

PROJECT_ROOT = Path(__file__).resolve().parents[4]
MIGRATION_DIR = PROJECT_ROOT / "database" / "migrations"
SEED_DIR = PROJECT_ROOT / "database" / "seeds"


def _engine(database_url: str | URL | None = None, *, autocommit: bool = False):
    engine = create_engine(database_url or settings.database_url, pool_pre_ping=True)
    if autocommit:
        return engine.execution_options(isolation_level="AUTOCOMMIT")
    return engine


def _run_sql_file(path: Path) -> None:
    sql = path.read_text(encoding="utf-8")
    statements = _split_sql_statements(sql)
    with _engine().begin() as connection:
        for statement in statements:
            connection.exec_driver_sql(statement)
    print(f"Executed {path.relative_to(PROJECT_ROOT)}")


def _split_sql_statements(sql: str) -> list[str]:
    statements: list[str] = []
    current: list[str] = []
    in_single_quote = False
    index = 0

    while index < len(sql):
        char = sql[index]
        next_char = sql[index + 1] if index + 1 < len(sql) else ""

        if char == "'" and next_char == "'":
            current.append(char)
            current.append(next_char)
            index += 2
            continue

        if char == "'":
            in_single_quote = not in_single_quote

        if char == ";" and not in_single_quote:
            statement = "".join(current).strip()
            if statement:
                statements.append(statement)
            current = []
        else:
            current.append(char)

        index += 1

    statement = "".join(current).strip()
    if statement:
        statements.append(statement)
    return statements


def _run_sql_dir(path: Path) -> None:
    for sql_file in sorted(path.glob("*.sql")):
        _run_sql_file(sql_file)


def create_database() -> None:
    url = make_url(settings.database_url)
    database_name = url.database
    if not database_name:
        raise RuntimeError("DATABASE_URL must include a database name")

    admin_url = url.set(database="postgres")
    engine = _engine(admin_url, autocommit=True)
    with engine.connect() as connection:
        exists = connection.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :database_name"),
            {"database_name": database_name},
        ).scalar()
        if exists:
            print(f"Database already exists: {database_name}")
            return
        connection.exec_driver_sql(f'CREATE DATABASE "{database_name}"')
        print(f"Created database: {database_name}")


def init_tables() -> None:
    _run_sql_dir(MIGRATION_DIR)


def seed_data() -> None:
    _run_sql_dir(SEED_DIR)


def reset_schema() -> None:
    with _engine().begin() as connection:
        connection.exec_driver_sql("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
    print("Reset public schema")
    init_tables()
    seed_data()


def main() -> None:
    parser = argparse.ArgumentParser(description="FitTrack database utility")
    parser.add_argument("command", choices=["create", "init", "seed", "reset"])
    args = parser.parse_args()

    if args.command == "create":
        create_database()
    elif args.command == "init":
        init_tables()
    elif args.command == "seed":
        seed_data()
    elif args.command == "reset":
        reset_schema()


if __name__ == "__main__":
    main()
