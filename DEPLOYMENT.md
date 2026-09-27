# 🚀 End-to-End GitHub & Vercel Deployment Guide

This guide walks you through pushing the **SVKM Global University (SNGU) Dhule AI Voice & Telephony Platform** to GitHub and deploying it on **Vercel** in less than 3 minutes.

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Step 1: Push Repository to GitHub](#step-1-push-repository-to-github)
3. [Step 2: Deploy to Vercel (1-Click)](#step-2-deploy-to-vercel-1-click)
4. [Step 3: Backend Cloud Deployment (Optional for FastAPI Server)](#step-3-backend-cloud-deployment-optional)
5. [Verification Checklist](#5-verification-checklist)

---

## 1. Prerequisites
- A free [GitHub Account](https://github.com).
- A free [Vercel Account](https://vercel.com) (Log in with your GitHub account).
- [Git](https://git-scm.com/downloads) installed on your computer (or use [GitHub Desktop](https://desktop.github.com/)).

---

## Step 1: Push Repository to GitHub

### Method A: Using the Automated Windows Script (1-Click)
1. Open the project folder on your computer.
2. Double-click the file named **`push_to_github.bat`**.
3. When prompted, enter your GitHub repository URL (e.g., `https://github.com/your-username/sngu-telephony-platform.git`).
4. The script will automatically initialize Git, stage all files, commit, and push to the `main` branch.

---

### Method B: Using Git Command Line (Terminal / PowerShell)
Open PowerShell or Terminal in the project root directory and run:

```bash
# 1. Initialize Git repository
git init

# 2. Stage all files (respects .gitignore)
git add .

# 3. Create initial commit
git commit -m "feat: complete SNGU Dhule AI voice telephony, two-way counselor auth & admin command center"

# 4. Set branch name to main
git branch -M main

# 5. Connect to your GitHub repository
# Replace with your actual GitHub repo URL created at github.com/new
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git

# 6. Push code to GitHub
git push -u origin main
```

---

### Method C: Using GitHub Desktop
1. Open **GitHub Desktop**.
2. Click **File** > **Add Local Repository...**.
3. Choose the folder: `c:\Users\jojo\OneDrive\Desktop\kavita mam told project`.
4. Click **Publish repository** to GitHub.

---

## Step 2: Deploy to Vercel (1-Click)

### 1. Import Repository into Vercel
1. Navigate to **[vercel.com/new](https://vercel.com/new)**.
2. In the **"Import Git Repository"** section, select your newly pushed GitHub repository.
3. Click **Import**.

### 2. Configure Project Settings
- **Project Name:** `sngu-dhule-telephony-platform` (or any name you prefer).
- **Framework Preset:** `Other` (or `Vite` if deploying React app).
- **Root Directory:** Keep as `./` (Root).
- The included `vercel.json` will automatically configure:
  - Clean URLs (`/login`, `/admin-dashboard`, `/counselor-portal`, `/registrar-dashboard`, `/simulator`)
  - Security headers & asset caching
  - Seamless routing for both static pages and React SPA

### 3. Click Deploy
Click **"Deploy"**. Vercel will complete deployment in ~30 seconds and provide a live production URL:
`https://sngu-dhule-telephony-platform.vercel.app`

---

## Step 3: Backend Cloud Deployment (Optional)

If you want to host the Python FastAPI server in the cloud:

### Deploy on Render (Free & Fast)
1. Go to **[render.com](https://render.com)** and create a new **Web Service**.
2. Connect your GitHub repository.
3. Set the following settings:
   - **Environment:** `Python 3`
   - **Root Directory:** `./`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
4. Click **Create Web Service**.
5. Once deployed, copy your Render URL (e.g. `https://sngu-backend.onrender.com`) and update `target` in `frontend/vite.config.ts` if needed.

---

## 5. Verification Checklist

| Page / Feature | Production URL Path | Expected Behavior |
| :--- | :--- | :--- |
| **University Landing Page** | `/` or `/index.html` | SNGU Dhule campus view, notice board, schools (STME, SPTM, SOC), 7 B.Tech branches, Call Simulator CTA, Sign In button. |
| **Role-Based Auth Portal** | `/login` or `/login.html` | Two-Way Counselor Login (Org Email vs User ID), Credential Slip generator on signup, Forgot Password modal. |
| **Admin Command Center** | `/admin-dashboard` | Counselor CRUD table, Salary & Email, Request Approval feed, Admin Profile edit modal, telemetry analytics. |
| **Counselor Workstation** | `/counselor-portal` | Isolated counselor workstation, 4 presence states (`AVAILABLE`, `BUSY`, `ON_BREAK`, `ON_LEAVE`), ₹78,500 salary display, password updater. |
| **Registrar Portal** | `/registrar-dashboard` | 940 seats admission matrix, CAP rounds, document verification. |
| **Multilingual Call Simulator** | `/simulator` | Whisper STT, English/Hindi/Marathi voice synthesis, 20s atomic counselor reservation lock. |

---

🎉 **Your project is 100% production ready and deployed!**
