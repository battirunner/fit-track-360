.PHONY: dev sync lint test

UV_CACHE_DIR ?= ../../.uv-cache
SHELL := powershell.exe
.SHELLFLAGS := -NoProfile -ExecutionPolicy Bypass -Command

dev:
	$$env:UV_CACHE_DIR='$(UV_CACHE_DIR)'; $$env:PYTHONDONTWRITEBYTECODE='1'; $$env:PYTHONUTF8='1'; uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

sync:
	$$env:UV_CACHE_DIR='$(UV_CACHE_DIR)'; uv sync

lint:
	$$env:UV_CACHE_DIR='$(UV_CACHE_DIR)'; uv run ruff check app

test:
	$$env:UV_CACHE_DIR='$(UV_CACHE_DIR)'; $$env:PYTHONDONTWRITEBYTECODE='1'; uv run pytest
