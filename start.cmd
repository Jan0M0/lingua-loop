@echo off
rem Lingua Loop launcher
cd /d "%~dp0"
if not exist "node_modules" (
  call npm install || goto :err
)
if not exist "dist\index.html" (
  call npm run build || goto :err
)
start "" http://localhost:4322/
call npx vite preview --port 4322 --strictPort
goto :eof
:err
echo.
echo Startup failed.
pause
