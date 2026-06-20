@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set "HTTPD="
for /f "delimiters=" %%H in ('dir /s /b "C:\laragon2\bin\apache\httpd.exe" 2^>nul') do (
  set "HTTPD=%%H"
  goto :found
)
for /f "delimiters=" %%H in ('dir /s /b "C:\laragon\bin\apache\httpd.exe" 2^>nul') do (
  set "HTTPD=%%H"
  goto :found
)

echo [ERREUR] httpd.exe introuvable sous C:\laragon2\bin\apache
pause
exit /b 1

:found
for %%D in ("%HTTPD%") do set "HTTPD_BIN=%%~dpD"

echo Apache trouve : %HTTPD%
echo DocumentRoot attendu : C:\laragon2\www\sapelli
echo Dossier conf : %HTTPD_BIN%conf\

if not exist "%HTTPD_BIN%conf\httpd.conf" (
  echo.
  echo [ATTENTION] httpd.conf introuvable !
  if exist "%HTTPD_BIN%conf\httpd.cong" (
    echo Fichier httpd.cong detecte — renommez en httpd.conf ^(extension .conf, pas .cong^)
  )
  pause
  exit /b 1
)

echo.
echo Test de la configuration...
"%HTTPD%" -t
if errorlevel 1 (
  echo.
  echo [ERREUR] Corrigez httpd.conf puis relancez ce script.
  pause
  exit /b 1
)

tasklist | findstr /I httpd.exe >nul 2>&1
if not errorlevel 1 (
  echo Apache est deja demarre.
  goto :test
)

echo Demarrage Apache...
start "" "%HTTPD%"

:test
timeout /t 2 /nobreak >nul
curl.exe -s -o NUL -w "port 82 -> HTTP %%{http_code}\n" http://127.0.0.1:82/ 2>nul
curl.exe -s -o NUL -w "port 80 -> HTTP %%{http_code}\n" http://127.0.0.1:80/ 2>nul
echo.
echo URL Sapelli : http://172.17.15.121:82/#/energizer-login
pause
