---
title: ReqGen AI Backend
emoji: 🎙️
colorFrom: blue
colorTo: purple
sdk: gradio
sdk_version: 4.44.0
app_file: app.py
pinned: false
license: mit
---

# 🎙️ ReqGen AI Backend

Audio transcription and text summarization API using **Whisper** and **T5** models.

## Features
- 🎤 **Audio Transcription** - Whisper supports 99+ languages including Hindi/English code-switching
- 📝 **Text Refinement** - T5 model for summarization and cleanup
- 📄 **Document Generation** - Generate BRD and Purchase Order documents
- 🔄 **Process Audio** - Combined transcription + summarization in one call

## How to Deploy

### Step 1: Create HF Space
1. Go to [huggingface.co/spaces](https://huggingface.co/spaces)
2. Click "Create new Space"
3. Choose **Gradio** as SDK
4. Name it: `reqgen-ai` (or any name)
5. Select **Free CPU** tier

### Step 2: Upload Files
Upload these 3 files to your Space:
- `README.md` (this file)
- `app.py`
- `requirements.txt`

### Step 3: Wait for Build
- The Space will automatically install dependencies and start
- First build takes 2-5 minutes (downloading Whisper + T5 models)
- You'll see a Gradio interface when ready

### Step 4: Connect to ReqGen
Set the environment variable in your Node.js backend:
```bash
PYTHON_BACKEND_URL=https://YOUR-USERNAME-reqgen-ai.hf.space
```

Replace `YOUR-USERNAME` with your Hugging Face username.

## API Endpoints (via Gradio)

| Function | Tab Index | Description |
|----------|-----------|-------------|
| `transcribe_audio` | 0 | Audio → Text |
| `summarize_text` | 1 | Text → Summary |
| `process_audio` | 4 | Audio → Text + Summary |
| `generate_document` | 5 | Text → BRD/PO Document |
| `health_check` | 7 | Check if API is running |

## Models Used
- **Whisper tiny** - Fast multilingual speech recognition
- **flan-t5-small** - Efficient text summarization

## Resource Usage
- Runs on **CPU** (free tier compatible)
- ~2GB RAM usage
- First request may be slow (model loading ~30s)

---

Built for [ReqGen](https://github.com/your-repo/reqgen) - Voice to Business Document Generator
