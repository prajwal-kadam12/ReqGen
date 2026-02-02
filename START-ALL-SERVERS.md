# How to Run Both Servers at the Same Time

## The Problem
You need **TWO servers running simultaneously**:
1. **Python Backend** (Port 5000) - Handles audio transcription
2. **Frontend** (Port 5173 or 5025) - The web interface

## Solution: Open TWO Terminal Windows

### Terminal 1: Start Python Backend

```bash
# Navigate to python-backend folder
cd "c:\Users\USER\Downloads\BRD4-main (1)\BRD4-main\python-backend"

# Run the backend server
start-backend.bat
```

**Keep this terminal window open!** You should see:
```
============================================
Audio Transcription & Summarization Backend
============================================
Server starting on http://0.0.0.0:5000
...
```

---

### Terminal 2: Start Frontend

```bash
# Navigate to the main project folder
cd "c:\Users\USER\Downloads\BRD4-main (1)\BRD4-main"

# Run the frontend
npm run dev
```

**Keep this terminal window open too!** You should see:
```
serving on port 5025
```

---

## Quick Start (Automated)

I've created a script that opens both servers for you automatically:

**Double-click this file:**
```
START-BOTH-SERVERS.bat
```

This will:
1. Open Terminal 1 with Python backend
2. Open Terminal 2 with Frontend
3. Both will run simultaneously

---

## Verify Both Are Running

Open your browser and check:
- ✅ Backend: http://localhost:5000/api/health
- ✅ Frontend: http://localhost:5173 (or http://localhost:5025)

---

## Important Notes

⚠️ **DO NOT close either terminal window** while using the application!

⚠️ **If you see "Terminate batch job (Y/N)?"** - Type **N** (No) to keep it running

⚠️ **To stop the servers**: Press `Ctrl+C` in each terminal window

---

## Troubleshooting

**Error: "Failed to fetch" or "ERR_CONNECTION_RESET"**
- Check if Python backend is still running in Terminal 1
- Restart it with `start-backend.bat`

**Port Already in Use**
- Close any other programs using ports 5000, 5173, or 5025
- Or restart your computer
