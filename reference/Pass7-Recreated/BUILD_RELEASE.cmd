@echo off
setlocal
cd /d "%~dp0"
echo Building Pass 7 Numerology Chart Creator...
dotnet publish "pass.csproj" -c Release -o "release\Pass7"
if errorlevel 1 (
  echo.
  echo The build failed. Review the messages above.
  pause
  exit /b 1
)
echo.
echo Build complete.
echo Open release\Pass7 and double-click Pass.exe.
pause
