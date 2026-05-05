
@echo off
setlocal enabledelayedexpansion

title FastAvatar CLI Setup

echo --- FastAvatar CLI Setup ---
echo.

echo [1/4] Checking Node.js...
node -v >nul 2>&1
if errorlevel 1 goto :install_node

for /f "tokens=*" %%i in ('node -v') do set "NODE_VER=%%i"
echo [OK] Found Node.js (!NODE_VER!).
goto :after_node_check

:install_node
echo [!] Node.js not found. Downloading...

powershell -NoProfile -ExecutionPolicy Bypass -Command "$url = 'https://nodejs.org/dist/v22.16.0/node-v22.16.0-x64.msi'; $out = 'nodejs_installer.msi'; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri $url -OutFile $out"
if errorlevel 1 (
    echo [X] Error: Failed to download Node.js.
    pause
    exit /b
)

if exist nodejs_installer.msi (
    echo [*] Installing Node.js 22 LTS... Please wait.
    msiexec.exe /i nodejs_installer.msi /qn /norestart

    echo [OK] Node.js installed.
    del nodejs_installer.msi
    echo [!] Note: You may need to restart your terminal after this setup.
) else (
    echo [X] Error: Failed to download Node.js.
    pause
    exit /b
)

set "NODEJS_DIR="
if exist "%ProgramFiles%\nodejs\npm.cmd" set "NODEJS_DIR=%ProgramFiles%\nodejs"
if not defined NODEJS_DIR if not "%ProgramFiles(x86)%"=="" if exist "%ProgramFiles(x86)%\nodejs\npm.cmd" set "NODEJS_DIR=%ProgramFiles(x86)%\nodejs"
if defined NODEJS_DIR set "PATH=%NODEJS_DIR%;%PATH%"

:after_node_check

echo.
echo [2/4] Installing dependencies...
call npm install --ignore-scripts
if errorlevel 1 (
    echo [X] npm install failed.
    pause
    exit /b
)
echo [OK] Dependencies installed.

echo.
echo [3/4] Linking CLI tool...
call npm link --ignore-scripts
if errorlevel 1 (
    echo [X] npm link failed.
    pause
    exit /b
)
echo [OK] CLI linked successfully.

echo.
echo [4/4] Build project...
call npm run build
if errorlevel 1 (
    echo [X] Build project is failed! Report issue or download Release Build at repo iamdinhduchuy/FastAvatar.
    pause
    exit /b
)

echo.
echo --- Setup Complete ---
echo You can now use the CLI command defined in your package.json.
echo.
pause
