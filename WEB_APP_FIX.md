# 🔧 ChainSage AI - Web App Setup Fix

If you're seeing **"API key is not configured"** error, follow these steps:

## ✅ Solution

### 1. Navigate to Web Directory
```bash
cd web
```

### 2. Create Environment File
```bash
# Copy the example file
cp .env.example .env.local
```

### 3. Add Your Gemini API Key

Edit `web/.env.local` and add your key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**Get a free API key:** https://aistudio.google.com/app/apikey

### 4. Restart the Server
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

That's it! The error should be gone. 🎉

## 📖 Detailed Setup

For complete setup instructions, see: [`web/SETUP.md`](web/SETUP.md)

## 🆘 Still Having Issues?

1. **Make sure the file is named exactly `.env.local`** (not `.env.local.txt`)
2. **Check there are no spaces** around the `=` sign
3. **Verify the API key is valid** at https://aistudio.google.com/app/apikey
4. **Clear Next.js cache**: Delete the `web/.next` folder and restart

## 📝 What Changed

Created these files:
- `web/.env.local` - Your local environment configuration (not tracked by git)
- `web/.env.example` - Template for environment variables
- `web/SETUP.md` - Detailed setup guide
- Updated `web/README.md` with correct setup instructions
