@echo off
REM =============================================================
REM IPL Prediction Bot - Automated Setup Script (Windows)
REM =============================================================
REM Usage: Double-click setup.bat or run from Command Prompt

echo ============================================
echo    IPL Prediction Bot - Setup Script
echo ============================================
echo.

REM -------------------------------------------------------
REM Step 1: Check Node.js
REM -------------------------------------------------------
echo [1/5] Checking Node.js...

node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js v16+ from https://nodejs.org
    echo Download the Windows installer (.msi) and run it.
    pause
    exit /b 1
)

FOR /F "tokens=*" %%i IN ('node --version') DO SET NODE_VERSION=%%i
echo [OK] Node.js found: %NODE_VERSION%

REM -------------------------------------------------------
REM Step 2: Check npm
REM -------------------------------------------------------
echo [2/5] Checking npm...

npm --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm not found!
    echo npm should be installed with Node.js. Please reinstall Node.js.
    pause
    exit /b 1
)

FOR /F "tokens=*" %%i IN ('npm --version') DO SET NPM_VERSION=%%i
echo [OK] npm found: v%NPM_VERSION%

REM -------------------------------------------------------
REM Step 3: Check project directory
REM -------------------------------------------------------
echo [3/5] Checking project files...

if not exist "package.json" (
    echo [ERROR] package.json not found!
    echo Please run this script from the project root directory.
    echo Example: cd C:\ipl-prediction-bot && scripts\setup.bat
    pause
    exit /b 1
)

echo [OK] Project files found

REM -------------------------------------------------------
REM Step 4: Install dependencies
REM -------------------------------------------------------
echo [4/5] Installing Node.js dependencies...

call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm install failed!
    echo Try running: npm install --legacy-peer-deps
    pause
    exit /b 1
)

echo [OK] Dependencies installed

REM -------------------------------------------------------
REM Step 5: Set up environment file
REM -------------------------------------------------------
echo [5/5] Setting up environment configuration...

if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo [OK] Created .env from .env.example
        echo.
        echo IMPORTANT: Edit .env with your credentials:
        echo   - TELEGRAM_BOT_TOKEN
        echo   - MONGODB_URI
        echo   - RAZORPAY_KEY_ID
        echo   - RAZORPAY_KEY_SECRET
        echo   - ADMIN_USER_ID
    ) else (
        echo [WARNING] No .env.example found. Create .env manually.
    )
) else (
    echo [OK] .env file already exists
)

REM -------------------------------------------------------
REM Done!
REM -------------------------------------------------------
echo.
echo ============================================
echo    Setup Complete!
echo ============================================
echo.
echo Next steps:
echo.
echo 1. Edit your .env file with real credentials:
echo    notepad .env
echo.
echo 2. Start the bot:
echo    npm start
echo.
echo 3. Verify the bot is running:
echo    Open browser: http://localhost:8000/health
echo.
echo Documentation:
echo    SETUP_GUIDE.md      - Detailed setup instructions
echo    TROUBLESHOOTING.md  - Common issues and solutions
echo.
pause
