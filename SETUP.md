# Skillwave Studio - Setup Guide

## 🔐 Environment Variables Setup

### Frontend (.env)
Copy `frontend/.env.example` to `frontend/.env` and fill in your real API keys:

```bash
cp frontend/.env.example frontend/.env
```

Required environment variables:
- `REACT_APP_BACKEND_URL`: Your backend URL (provided by deployment platform)
- `REACT_APP_OPENAI_API_KEY`: Get from https://platform.openai.com/api-keys
- `REACT_APP_FIREBASE_*`: Get from Firebase Console (https://console.firebase.google.com)
- `REACT_APP_SUPABASE_*`: Get from Supabase Dashboard (https://app.supabase.com)

### Backend (.env)
Copy `backend/.env.example` to `backend/.env` and configure:

```bash
cp backend/.env.example backend/.env
```

## 🚀 Quick Start

1. **Install Dependencies**:
   ```bash
   cd frontend && yarn install
   cd ../backend && pip install -r requirements.txt
   ```

2. **Setup Environment Variables** (see above)

3. **Run Development Servers**:
   ```bash
   # Backend
   cd backend && python main.py
   
   # Frontend (in new terminal)
   cd frontend && yarn start
   ```

## ⚠️ Security Notice

- **NEVER commit .env files to Git**
- Always use `.env.example` with fake values
- Real API keys should only be in:
  - Local development (.env files)
  - Production deployment platform settings