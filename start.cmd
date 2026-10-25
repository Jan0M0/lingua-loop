@echo off
chcp 65001 >nul
title Lingua Loop
cd /d "%~dp0"

rem 已在运行就直接开浏览器——本脚本可以放心重复双击
netstat -ano | findstr /c:":4322 " | findstr /c:"LISTENING" >nul 2>&1
if not errorlevel 1 (
  start "" "http://localhost:4322/"
  echo 服务已在运行，已在浏览器打开 Lingua Loop。
  echo 已安装桌面应用的话，直接双击桌面图标即可，无需本窗口。
  timeout /t 5 >nul
  goto :eof
)

if not exist "node_modules" (
  echo 首次运行：正在安装依赖，约 1-2 分钟……
  call npm install
  if errorlevel 1 goto :err
)
if not exist "dist\index.html" (
  echo 正在构建应用……
  call npm run build
  if errorlevel 1 goto :err
)

echo 正在启动本地服务（窗口已最小化到任务栏）……
start "LinguaLoop 服务" /min cmd /c "npx vite preview --port 4322 --strictPort"
timeout /t 2 /nobreak >nul
start "" "http://localhost:4322/"
echo.
echo 已在浏览器打开 Lingua Loop。
echo.
echo 建议（只需一次）：在应用的「设置」页最上方点「安装为桌面应用」。
echo 之后双击桌面图标即可离线使用，本窗口和任务栏里的服务窗口都可以关闭。
echo.
timeout /t 10 >nul
goto :eof

:err
echo.
echo 启动失败。请先安装 Node.js（https://nodejs.org，LTS 版），然后重新双击本文件。
pause
