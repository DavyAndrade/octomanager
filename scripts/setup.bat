@echo off
setlocal enabledelayedexpansion

echo.
echo  OctoManager - Setup Script
echo  ──────────────────────────────────────────────────
echo.

:: 1. Check for Bun
where bun >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Bun is not installed.
    echo           Install it from https://bun.sh
    exit /b 1
)
for /f "tokens=*" %%v in ('bun --version') do set BUN_VER=%%v
echo [OK] Bun !BUN_VER! found

:: 2. Install dependencies
echo.
echo Installing dependencies...
bun install
echo [OK] Dependencies installed

:: 3. Create .env.local from example
if not exist ".env.local" (
    copy ".env.local.example" ".env.local" >nul
    echo [OK] Created .env.local from .env.local.example
) else (
    echo [SKIP] .env.local already exists
)

:: 4. Done
echo.
echo  ──────────────────────────────────────────────────
echo  [OK] Setup complete!
echo.
echo  Next steps:
echo    1. Open .env.local and fill in your values:
echo       - AUTH_SECRET       (generate a random secret)
echo       - AUTH_GITHUB_ID    (from GitHub OAuth App)
echo       - AUTH_GITHUB_SECRET
echo       - NEXTAUTH_URL      (http://localhost:3000)
echo.
echo    2. Start the development server:
echo       scripts\start.bat
echo       -- or --
echo       bun run dev
echo.
endlocal
