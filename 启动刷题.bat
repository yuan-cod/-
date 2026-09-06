@echo off
chcp 65001 >nul
title 计算机组成原理刷题 PWA 本地服务
cd /d "%~dp0"

rem 优先使用 Node.js 启动（零依赖）
where node >nul 2>nul
if %errorlevel%==0 (
  echo 正在通过 Node.js 启动本地服务...
  node serve.cjs 8765
  pause
  exit /b
)

rem 其次尝试 Python
where python >nul 2>nul
if %errorlevel%==0 (
  echo 正在通过 Python 启动本地服务...
  start "" "http://127.0.0.1:8765/index.html"
  python -m http.server 8765
  pause
  exit /b
)

echo 未检测到 Node.js 或 Python。
echo 方案一：安装 Node.js（https://nodejs.org）后重新双击本文件。
echo 方案二：将整个 jzyl-pwa 文件夹上传到任意静态网站空间 / GitHub Pages 后访问。
pause
