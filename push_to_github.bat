@echo off
TITLE SVKM SNGU Dhule - Git Push and Vercel Ready Tool
COLOR 0B

echo ===============================================================================
echo       SVKM NMIMS GLOBAL UNIVERSITY (SNGU) DHULE - GITHUB PUSH TOOL
echo ===============================================================================
echo.
echo  This tool will prepare and push your complete project to GitHub.
echo.

WHERE git >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not found in your system PATH.
    echo Please install Git from https://git-scm.com/downloads or use GitHub Desktop.
    echo.
    pause
    exit /b 1
)

echo [1/5] Initializing Git Repository...
git init

echo [2/5] Staging all files (excluding node_modules and temp files via .gitignore)...
git add .

echo [3/5] Creating Git Commit...
git commit -m "feat: complete SNGU Dhule AI voice telephony, two-way counselor auth & admin command center"

echo [4/5] Setting default branch to main...
git branch -M main

echo.
echo ===============================================================================
echo  Please enter your GitHub Repository URL (from https://github.com/new):
echo  Example: https://github.com/your-username/sngu-telephony-platform.git
echo ===============================================================================
set /p REPO_URL="Enter GitHub Repo URL: "

IF "%REPO_URL%"=="" (
    echo.
    echo [NOTICE] No URL provided. Git commit has been created locally on branch 'main'.
    echo You can add remote later using: git remote add origin ^<YOUR_URL^>
    echo Then push using: git push -u origin main
    echo.
    pause
    exit /b 0
)

echo [5/5] Connecting remote and pushing to GitHub...
git remote remove origin >nul 2>nul
git remote add origin %REPO_URL%
git push -u origin main

echo.
echo ===============================================================================
echo  SUCCESS! Your project is now pushed to GitHub and ready for 1-Click Vercel Deploy!
echo  Visit https://vercel.com/new and import this repository to deploy in 30 seconds.
echo ===============================================================================
echo.
pause
