@echo off
TITLE Push to GitHub - yuvrajcet26-dotcom/Voice-Ai
COLOR 0A

echo ===============================================================================
echo       SVKM NMIMS GLOBAL UNIVERSITY (SNGU) DHULE - GITHUB PUSH TOOL
echo       Target Repository: https://github.com/yuvrajcet26-dotcom/Voice-Ai.git
echo ===============================================================================
echo.

SET "GIT_EXE=git"
WHERE git >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    IF EXIST "%LOCALAPPDATA%\GitHubDesktop\app-3.5.12\resources\app\git\cmd\git.exe" (
        SET "GIT_EXE=%LOCALAPPDATA%\GitHubDesktop\app-3.5.12\resources\app\git\cmd\git.exe"
    ) ELSE (
        echo [ERROR] Git was not found in PATH or GitHub Desktop.
        echo Please install Git from https://git-scm.com/downloads
        pause
        exit /b 1
    )
)

echo [1/4] Ensuring Git repository is initialized...
"%GIT_EXE%" init >nul 2>nul
"%GIT_EXE%" branch -M main >nul 2>nul

echo [2/4] Staging all updated project files...
"%GIT_EXE%" add .

echo [3/4] Creating commit...
"%GIT_EXE%" commit -m "feat: complete SNGU Dhule AI voice admission, two-way counselor auth & intelligent routing platform" >nul 2>nul

echo [4/4] Setting remote origin to https://github.com/yuvrajcet26-dotcom/Voice-Ai.git...
"%GIT_EXE%" remote remove origin >nul 2>nul
"%GIT_EXE%" remote add origin https://github.com/yuvrajcet26-dotcom/Voice-Ai.git

echo.
echo Pushing commits to branch 'main'...
"%GIT_EXE%" push -u origin main

IF %ERRORLEVEL% EQU 0 (
    echo.
    echo ===============================================================================
    echo  SUCCESS! Your project is now live on GitHub:
    echo  https://github.com/yuvrajcet26-dotcom/Voice-Ai
    echo.
    echo  NEXT STEP (Vercel Deploy):
    echo  1. Open https://vercel.com/new
    echo  2. Select 'Voice-Ai' and click Deploy!
    echo ===============================================================================
) ELSE (
    echo.
    echo [NOTE] If GitHub asks for authentication, sign in with your GitHub account in the browser prompt.
    echo Or push using GitHub Desktop: Open GitHub Desktop -> File -> Add Local Repository -> Publish.
)

echo.
pause
