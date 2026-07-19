@echo off
REM Start the SOMS static website on the assigned app port.
if "%APP_PORT%"=="" set APP_PORT=3000
echo Serving SOMS website on port %APP_PORT%
python -m http.server %APP_PORT%
