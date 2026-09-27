# 🏛️ SVKM NMIMS Global University (SNGU), Dhule
### AI-Powered Multilingual Voice Admission, Information & Intelligent Counselor Routing Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
![Platform](https://img.shields.io/badge/Platform-SVKM%20SNGU%20Dhule-blue)
![Frontend](https://img.shields.io/badge/Frontend-Vite%20%7C%20React%2019%20%7C%20TailwindCSS%204-61DAFB)
![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Uvicorn%20%7C%20WebSockets-009688)
![AI Voice STT](https://img.shields.io/badge/Voice%20STT-OpenAI%20Whisper--v3-green)
![Languages](https://img.shields.io/badge/Languages-English%20%7C%20Hindi%20%7C%20Marathi-orange)
![License](https://img.shields.io/badge/License-MIT-purple)

---

## 🌟 Executive Overview

An enterprise-grade, end-to-end intelligent telephony, academic admissions governance, and AI-driven multilingual voice routing platform built specifically for **SVKM NMIMS Global University (SNGU), Dhule Campus**.

The platform seamlessly handles inbound admission inquiries in **English (EN)**, **Hindi (HI)**, and **Marathi (MR)**, delivers real-time AI responses via a RAG Knowledge Base, executes a **20-second atomic reservation lock**, and routes complex inquiries to specialized school counselors across:
- **STME** — Mukesh Patel School of Technology Management & Engineering (7 B.Tech Branches)
- **SPTM** — Shobhaben Pratapbhai Patel School of Pharmacy & Technology Management
- **SOC** — School of Commerce

---

## 🚀 Key System Features

### 1. 🎙️ Multilingual AI Voice Telephony & Simulator
- **Trilingual Speech-to-Text (STT):** Real-time transcriptions in English, Hindi, and Marathi powered by Whisper-v3.
- **RAG Knowledge Assistant:** Immediate answering of fees, eligibility, hostel amenities, and MHT-CET/JEE cutoffs.
- **20-Second Atomic Counselor Lock:** Zero-collision counselor reservation system. If the designated counselor does not answer within 20s, the call safely cascades to the next available faculty counselor in the pool.

### 2. 🔐 Strict Role-Based Access Control (RBAC) & Two-Way Counselor Login
- **Dual Counselor Login:** Counselors can authenticate using **either**:
  - **Way 1:** Official Organization Email (`counselor.c@svkm.ac.in` / `anita.sharma@svkm.ac.in`)
  - **Way 2:** User ID or Username (`SNGU-CNS-STME-003` / `chetan.patil` / `counselor.c`)
- **Official Credential Allocation Slip:** When a new user registers (Counselor, Registrar, or Admin), the system halts direct sign-in and generates an official credential slip with 1-click copy buttons before proceeding to login.
- **Persistent Password Reset:** Self-service security credential recovery modal matching either User ID or Organization Email.

### 3. 💼 Isolated Counselor Workstations
- **4 Live Presence States:** `AVAILABLE` (listening for calls), `BUSY` (engaged), `ON_BREAK` (paused), and `ON_LEAVE` (automatic leave application submitted to Main Admin).
- **Faculty Profile & Compensation:** Displays sanctioned monthly salary grade (`₹78,500 / month`), department, and languages.
- **In-App Password Management:** Counselors can update their security credentials directly from their profile view.
- **Administrative Requests Feed:** Counselors can submit shift adjustment, leave, salary slip, and hardware requests directly to the Admin approval queue.

### 4. 👑 Superuser Admin Command Center (`admin-dashboard.html`)
- **Full Counselor CRUD:** Add, edit, and deactivate counselors across STME, SPTM, and SOC pools with salary and email assignment.
- **Admin Profile Customization Modal:** Main Admin can update their name (`Dr. S. K. Mehta`), official title, email, phone number, and campus office (`Admin Complex, Block A-101`), with real-time header reflection and persistent storage.
- **Request Approval Queue:** Live 1-click approval/rejection of counselor shift changes and leave requests.
- **Live Telemetry & Analytics:** Hourly call volume influx charts, language distribution breakdown, and ExoPhone dispatch metrics.

### 5. 📜 University Registrar Governance Portal (`registrar-dashboard.html`)
- **Admissions Seat Matrix:** 940 sanctioned seats across B.Tech, B.Pharm, and B.Com/BBA.
- **CAP Round Allotments:** CAP Round I & II seat clearance, document verification status, and merit circular broadcast.

---

## 🔑 Standard Pre-Configured Database Credentials

| Role | User ID (Way 2) | Official Email (Way 1) | Password | Portal Target |
| :--- | :--- | :--- | :--- | :--- |
| **Main Administrator** | `SNGU-ADM-001` | `admin@svkm.ac.in` | `Admin@123` | `admin-dashboard.html` |
| **University Registrar** | `SNGU-REG-001` | `registrar@svkm.ac.in` | `Registrar@123` | `registrar-dashboard.html` |
| **Counselor C (STME)** | `SNGU-CNS-STME-003` | `counselor.c@svkm.ac.in` | `Counselor@123` | `counselor-portal.html?counselor=c` |
| **Counselor A (STME)** | `SNGU-CNS-STME-001` | `anita.sharma@svkm.ac.in` | `Counselor@123` | `counselor-portal.html?counselor=a` |
| **Counselor B (STME)** | `SNGU-CNS-STME-002` | `bharat.dave@svkm.ac.in` | `Counselor@123` | `counselor-portal.html?counselor=b` |
| **Counselor D (STME)** | `SNGU-CNS-STME-004` | `deepali.wagh@svkm.ac.in` | `Counselor@123` | `counselor-portal.html?counselor=d` |
| **Counselor E (STME)** | `SNGU-CNS-STME-005` | `eknath.shinde@svkm.ac.in` | `Counselor@123` | `counselor-portal.html?counselor=e` |

---

## 📁 Repository Structure

```
kavita-mam-told-project/
├── .github/                      # GitHub Actions CI/CD workflows
├── backend/                      # FastAPI Python Backend
│   ├── app/
│   │   ├── api/v1/               # REST API endpoints (auth, counselors, telephony, etc.)
│   │   ├── core/                 # App configuration & settings
│   │   ├── database/             # SQLite DB connection & schema initialization
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── schemas/              # Pydantic validation schemas
│   │   └── services/             # WebSocket manager & telephony service
│   ├── requirements.txt          # Python backend dependencies
│   └── svkm_voice.db             # Local SQLite database
├── frontend/                     # Modern React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/           # Reusable UI components & modals
│   │   ├── context/              # AuthContext & state providers
│   │   ├── pages/                # React Dashboard, Counselor Portal, Simulator pages
│   │   ├── services/             # Axios API client & WebSocket handler
│   │   └── types/                # TypeScript interface definitions
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.ts            # Vite build configuration with proxy
│   └── vercel.json               # Direct frontend Vercel configuration
├── index.html                    # 🏛️ SNGU Dhule University Main Landing Page
├── login.html                    # 🔐 Multi-Role & Two-Way Authentication Portal
├── admin-dashboard.html          # 👑 Superuser Admin Command Center & CRUD
├── counselor-portal.html         # 🎧 Isolated Counselor Workstation & Telemetry
├── registrar-dashboard.html      # 📜 University Registrar Admissions Portal
├── simulator.html                # 🎙️ Multilingual Call Simulator
├── package.json                  # Root Monorepo configuration
├── vercel.json                   # Root Vercel 1-Click Deployment configuration
├── requirements.txt              # Root Python requirements
├── .gitignore                    # Comprehensive Git ignore rules
├── .gitattributes                # Cross-platform line ending normalization
├── push_to_github.bat            # ⚡ 1-Click Windows script to push to GitHub
├── DEPLOYMENT.md                 # 📖 Comprehensive Vercel & Cloud Deployment Guide
└── README.md                     # 📖 Project Documentation (This File)
```

---

## ⚡ 1-Click Vercel Deployment Guide

### Option 1: Deploy Entire Multi-Page Application (Recommended)
1. **Push this repository to GitHub** (see instructions below).
2. Go to [vercel.com/new](https://vercel.com/new).
3. Select your GitHub repository.
4. Keep the **Root Directory** as `./` (default).
5. Click **Deploy**. Vercel will immediately deploy the complete application with clean URLs!

### Option 2: Deploy React SPA Application
1. In the Vercel Project Settings, set **Root Directory** to `frontend`.
2. Framework Preset: `Vite`.
3. Click **Deploy**.

---

## 💻 How to Push to GitHub

### Method 1: Using the Automated Windows Script (Easiest)
Simply double-click `push_to_github.bat` in the project root folder. It will initialize Git, stage all files, and prompt for your GitHub repository URL to push directly.

### Method 2: Using the Command Line
```bash
# 1. Initialize Git repository
git init

# 2. Add all project files
git add .

# 3. Commit changes
git commit -m "feat: complete SNGU Dhule AI voice admission & intelligent counselor routing platform"

# 4. Set main branch
git branch -M main

# 5. Link to your GitHub repository
git remote add origin https://github.com/yuvrajcet26-dotcom/Voice-Ai.git

# 6. Push to GitHub
git push -u origin main
```

---

## 🛠️ Local Development Setup

### 1. Running the FastAPI Backend
```bash
# Navigate to backend and install requirements
pip install -r requirements.txt

# Start FastAPI server on port 8000
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Docs: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/api/v1/health`

### 2. Running the React Frontend
```bash
cd frontend
npm install
npm run dev
```
- Access Frontend: `http://localhost:3000`

### 3. Running the Standalone Multi-Page Web Portal
Open `index.html` directly in any modern web browser or serve with:
```bash
npx serve .
```

---

## 📄 License & Attribution
Designed & developed for **SVKM NMIMS Global University (SNGU), Dhule**.  
All rights reserved © 2026.
