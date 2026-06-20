$ErrorActionPreference = "Stop"

$backendRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path (Join-Path $backendRoot "..\..")

$env:UV_CACHE_DIR = Join-Path $projectRoot ".uv-cache"
$env:PYTHONDONTWRITEBYTECODE = "1"
$env:PYTHONUTF8 = "1"

Set-Location $backendRoot
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
