# Hugging Face Spaces Deployment Guide

ReqGen AI Backend ko Hugging Face Spaces par deploy karne ke liye ye guide follow karo.

## 🚀 Quick Start (5 Minutes)

### Step 1: Hugging Face Account Banao
1. [huggingface.co](https://huggingface.co) par jao
2. Sign Up karo (free hai)

### Step 2: New Space Create Karo
1. [huggingface.co/spaces](https://huggingface.co/spaces) par jao
2. **"Create new Space"** button click karo
3. Settings:
   - **Space name**: `reqgen-ai`
   - **SDK**: `Gradio`
   - **Hardware**: `CPU basic` (free)
   - **Visibility**: Public ya Private (tumhari choice)
4. "Create Space" click karo

### Step 3: Files Upload Karo
Space mein ye 3 files upload karo (drag & drop):

```
huggingface-spaces/
├── README.md
├── app.py
└── requirements.txt
```

### Step 4: Build Wait Karo
- Automatic build start hogi
- 2-5 minutes lagenge (models download honge)
- Green status dikhega jab ready ho

### Step 5: Test Karo
- Space URL kholo: `https://YOUR-USERNAME-reqgen-ai.hf.space`
- Gradio interface dikhega
- Audio upload karke test karo

---

## 🔗 ReqGen Se Connect Karo

### Local Development
`.env` file mein add karo:
```env
PYTHON_BACKEND_URL=https://YOUR-USERNAME-reqgen-ai.hf.space
```

### Render Deployment
Render dashboard mein Environment Variable add karo:
- **Key**: `PYTHON_BACKEND_URL`
- **Value**: `https://YOUR-USERNAME-reqgen-ai.hf.space`

---

## 📝 Features

| Feature | Description |
|---------|-------------|
| 🎤 Audio Transcription | Whisper model - 99+ languages support |
| 📝 Text Summarization | T5 model - Clean summary generation |
| 📄 Document Generation | BRD & Purchase Order auto-create |
| 🔄 Combined Processing | Upload audio → Get summary directly |

---

## ⚠️ Important Notes

1. **First Request Slow Hoga**
   - Models load hone mein 30-60 seconds lagte hain
   - Baad mein fast ho jayega

2. **Free Tier Limits**
   - CPU only (GPU paid hai)
   - Space sleep ho jata hai inactivity par
   - Wake up mein 30-60 seconds lagte hain

3. **Audio Formats Supported**
   - MP3, M4A, WAV, WebM, OGG
   - Max file size: ~10MB recommended

---

## 🛠️ Troubleshooting

### "Space is sleeping"
- Normal hai free tier par
- First request par wake up hoga

### "Model loading error"
- Space restart karo
- Check karo requirements.txt sahi hai

### "Transcription empty"
- Audio quality check karo
- Minimum 2-3 seconds audio hona chahiye

---
## 🔄 Manual Test Commands

Test your Gradio API endpoints:

```bash
# Health Check
curl https://YOUR-USERNAME-reqgen-ai.hf.space/

# Check API Info
curl https://YOUR-USERNAME-reqgen-ai.hf.space/info
```

---

Happy Coding! 🎉
