---
title: ReqGen AI Backend
emoji: 🎙️
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
---

# ReqGen AI Backend

Audio transcription (Whisper) + Text summarization (T5) REST API.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/health` | API health |
| POST | `/api/transcribe` | Transcribe audio |
| POST | `/api/summarize` | Summarize text |
| POST | `/api/process-audio` | Transcribe + Summarize |
| POST | `/api/generate-document` | Generate BRD/PO |
