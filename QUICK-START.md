# 🚀 Quick Start Guide - Audio Transcription

## ✅ What I Did For You

I've created an **automated script** that starts both servers you need!

---

## 🎯 How to Use (3 Simple Steps)

### Step 1: Start Both Servers

**Find and double-click this file:**
```
START-BOTH-SERVERS.bat
```

**Location:** `c:\Users\USER\Downloads\BRD4-main (1)\BRD4-main\START-BOTH-SERVERS.bat`

This will open **TWO terminal windows**:
- 🐍 **Window 1**: Python Backend (Port 5000)
- 🌐 **Window 2**: Frontend (Port 5173 or 5025)

### Step 2: Wait for Both to Start

**Window 1** should show:
```
============================================
Audio Transcription & Summarization Backend
============================================
Server starting on http://0.0.0.0:5000
```

**Window 2** should show:
```
serving on port 5025
```

### Step 3: Open Your Browser

Go to: **http://localhost:5173** (or **http://localhost:5025**)

---

## 🎤 Using Audio Transcription

1. **Navigate** to the "Audio Transcription" page
2. **Upload** an audio file (MP3, WAV, M4A, etc.)
3. **Wait** - It will automatically:
   - ✅ Transcribe speech to text
   - ✅ Generate AI summary
4. **Download** - Click buttons to save transcript or summary as `.txt` files

---

## ⚠️ IMPORTANT RULES

### ✅ DO:
- Keep **BOTH terminal windows open** while using the app
- If you see "Terminate batch job (Y/N)?" → Type **N** (No)

### ❌ DON'T:
- Don't close either terminal window
- Don't type "Y" when asked to terminate

---

## 🔧 If You Get Errors

**Error: "Failed to fetch" or "ERR_CONNECTION_RESET"**

This means one of the servers stopped. Solution:
1. Close both terminal windows
2. Double-click `START-BOTH-SERVERS.bat` again
3. Wait for both to start

---

## 🛑 How to Stop the Servers

When you're done:
1. Go to **each terminal window**
2. Press **Ctrl+C**
3. Close the windows

---

## 📁 Files I Created

- ✅ `START-BOTH-SERVERS.bat` - Starts everything automatically
- ✅ `start-backend.bat` - Starts just the Python backend
- ✅ `START-ALL-SERVERS.md` - Detailed instructions

---

## 🎉 You're Ready!

Just double-click `START-BOTH-SERVERS.bat` and you're good to go!
