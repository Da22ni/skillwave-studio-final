# Skillwave Studio - Setup Guide

## 🔐 Environment Variables Setup

### Frontend (.env)
The repository includes basic `.env` files for deployment compatibility. For local development:

```bash
cp frontend/.env.example frontend/.env.local  # Use .local for your real keys
```

### Backend (.env)
The `.env` file uses system environment variables with fallbacks:

```bash
MONGO_URL=${MONGO_URL:-mongodb://localhost:27017}  # Will use system MONGO_URL if available
DB_NAME=${DB_NAME:-skillwave_studio}
```

## 🚀 Deployment Notes

### Emergent Platform:
- Set environment variables in the Emergent deployment dashboard
- The app will automatically use system environment variables
- No need to modify `.env` files - they serve as templates

### Production Environment Variables Needed:
- `REACT_APP_BACKEND_URL`: Your deployed backend URL
- `REACT_APP_OPENAI_API_KEY`: OpenAI API key
- `REACT_APP_FIREBASE_*`: Firebase configuration
- `MONGO_URL`: MongoDB Atlas connection string
- `DB_NAME`: Database name

## 🔒 Security
- `.env` files in repo contain only templates/fallbacks
- Real API keys come from deployment platform environment variables
- Never commit real keys to Git