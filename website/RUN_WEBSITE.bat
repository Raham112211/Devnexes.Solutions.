@echo off
echo Starting DevNexes Solutions Website...
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

:: Start the server
echo Starting server on http://localhost:3000
echo.
echo Website Pages:
echo - Main Site: http://localhost:3000
echo - Projects: http://localhost:3000/projects.html
echo - Comments: http://localhost:3000/hub.html
echo - Admin Panel: http://localhost:3000/admin.html
echo - Start Project: http://localhost:3000/start-project.html
echo.
echo Press Ctrl+C to stop the server
echo.

node server.js