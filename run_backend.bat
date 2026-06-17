@echo off
echo Starting MediRoute Triage Backend Server (Portable Node)...
set PATH=%~dp0temp_downloads\node_portable\node-v20.14.0-win-x64;%PATH%
cd backend
call npm install
call npm run dev
pause
