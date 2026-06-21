.PHONY: dev sync lint test db-create db-init db-seed db-reset

UV_CACHE_DIR ?= ../../.uv-cache
SHELL := powershell.exe
.SHELLFLAGS := -NoProfile -ExecutionPolicy Bypass -Command

dev:
	$$env:UV_CACHE_DIR='$(UV_CACHE_DIR)'; $$env:PYTHONDONTWRITEBYTECODE='1'; $$env:PYTHONUTF8='1'; uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

sync:
	$$env:UV_CACHE_DIR='$(UV_CACHE_DIR)'; uv sync

lint:
	$$env:UV_CACHE_DIR='$(UV_CACHE_DIR)'; $$env:RUFF_CACHE_DIR='../../.ruff-cache'; uv run ruff check app

test:
	$$env:UV_CACHE_DIR='$(UV_CACHE_DIR)'; $$env:PYTHONDONTWRITEBYTECODE='1'; uv run pytest

db-create:
	$$env:UV_CACHE_DIR='$(UV_CACHE_DIR)'; $$env:PYTHONDONTWRITEBYTECODE='1'; uv run python -m app.scripts.db create

db-init:
	$$env:UV_CACHE_DIR='$(UV_CACHE_DIR)'; $$env:PYTHONDONTWRITEBYTECODE='1'; uv run python -m app.scripts.db init

db-seed:
	$$env:UV_CACHE_DIR='$(UV_CACHE_DIR)'; $$env:PYTHONDONTWRITEBYTECODE='1'; uv run python -m app.scripts.db seed

db-reset:
	$$env:UV_CACHE_DIR='$(UV_CACHE_DIR)'; $$env:PYTHONDONTWRITEBYTECODE='1'; uv run python -m app.scripts.db reset
