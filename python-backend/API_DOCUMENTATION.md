# Audio Transcription API Documentation

RESTful API for audio transcription and summarization using AI models.

## Base URL

```
http://localhost:5000/api
```

## Endpoints

### 1. Health Check

Check if the server is running and which models are loaded.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "message": "Audio Transcription Backend is running",
  "models_loaded": {
    "transcription": true,
    "summarization": true
  }
}
```

---

### 2. Transcribe Audio

Transcribe an audio file to text using Whisper ASR.

**Endpoint:** `POST /api/transcribe`

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `audio` (file): Audio file to transcribe

**Supported Formats:**
`.mp3`, `.wav`, `.m4a`, `.ogg`, `.flac`, `.aac`

**Max File Size:** 100 MB

**Example (curl):**
```bash
curl -X POST http://localhost:5000/api/transcribe \
  -F "audio=@recording.mp3"
```

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('audio', audioFile);

const response = await fetch('http://localhost:5000/api/transcribe', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
console.log(data.transcript);
```

**Success Response (200):**
```json
{
  "success": true,
  "transcript": "This is the transcribed text from the audio file...",
  "filename": "recording.mp3"
}
```

**Error Response (400):**
```json
{
  "error": "No audio file provided"
}
```

**Error Response (500):**
```json
{
  "error": "Transcription failed",
  "details": "Error message details..."
}
```

---

### 3. Summarize Text

Generate an AI summary from text input.

**Endpoint:** `POST /api/summarize`

**Request:**
- **Content-Type:** `application/json`
- **Body:**
```json
{
  "text": "Long text to summarize..."
}
```

**Min Text Length:** 50 characters

**Example (curl):**
```bash
curl -X POST http://localhost:5000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"text": "Your long text here..."}'
```

**Example (JavaScript):**
```javascript
const response = await fetch('http://localhost:5000/api/summarize', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Long text to summarize...'
  }),
});

const data = await response.json();
console.log(data.summary);
```

**Success Response (200):**
```json
{
  "success": true,
  "summary": "This is a concise summary of the text..."
}
```

**Error Response (400):**
```json
{
  "error": "Text too short for summarization (minimum 50 characters)"
}
```

**Error Response (500):**
```json
{
  "error": "Summarization failed",
  "details": "Error message details..."
}
```

---

### 4. Process Audio (Combined)

Transcribe AND summarize audio in a single request.

**Endpoint:** `POST /api/process-audio`

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `audio` (file): Audio file to process

**Example (curl):**
```bash
curl -X POST http://localhost:5000/api/process-audio \
  -F "audio=@meeting.wav"
```

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('audio', audioFile);

const response = await fetch('http://localhost:5000/api/process-audio', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
console.log('Transcript:', data.transcript);
console.log('Summary:', data.summary);
```

**Success Response (200):**
```json
{
  "success": true,
  "transcript": "Full transcription of the audio...",
  "summary": "AI-generated summary of the transcription...",
  "filename": "meeting.wav"
}
```

**Note:** If transcript is less than 50 characters, `summary` will be:
```json
"summary": "Text too short for summarization"
```

**Error Responses:** Same as `/api/transcribe`

---

### 5. Preload Models

Load both AI models into memory to reduce first-request latency.

**Endpoint:** `POST /api/models/preload`

**Request:** Empty body

**Example (curl):**
```bash
curl -X POST http://localhost:5000/api/models/preload
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "All models preloaded successfully"
}
```

**Error Response (500):**
```json
{
  "error": "Failed to preload models",
  "details": "Error message..."
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (missing/invalid input) |
| 500 | Server Error (processing failed) |

## Rate Limiting

Currently, no rate limiting is implemented. For production, implement rate limiting based on your requirements.

## CORS

The following origins are allowed by default:
- `http://localhost:5173` (Vite)
- `http://localhost:3000` (React)
- `http://127.0.0.1:5173`
- `http://127.0.0.1:3000`

To add more origins, edit `config.py`:
```python
CORS_ORIGINS = [
    "http://localhost:5173",
    "https://yourdomain.com",
]
```

## Processing Time

Processing times vary based on:
- Audio file length
- Hardware (CPU vs GPU)
- Model size

**Approximate times (CPU):**
- 1 min audio: 30-60 seconds transcription
- Summarization: 5-10 seconds

**With GPU:**
- 5-10x faster than CPU

## Best Practices

1. **File Size:** Keep audio files under 10 minutes for faster processing
2. **Format:** Use `.wav` at 16kHz for best accuracy
3. **Preload:** Call `/api/models/preload` after server startup
4. **Error Handling:** Always check `success` field in response
5. **Timeout:** Set adequate timeout (2-5 minutes) for long audio files

## Example Full Workflow

```javascript
// 1. Check server health
const health = await fetch('http://localhost:5000/api/health');
console.log(await health.json());

// 2. Upload and process audio
const formData = new FormData();
formData.append('audio', audioFile);

const result = await fetch('http://localhost:5000/api/process-audio', {
  method: 'POST',
  body: formData,
});

const data = await result.json();

if (data.success) {
  console.log('Transcript:', data.transcript);
  console.log('Summary:', data.summary);
} else {
  console.error('Error:', data.error);
}
```

## Support

For issues or questions:
- Check PYTHON_SETUP.md for troubleshooting
- Review server logs in terminal
- Ensure models are downloaded (first-time use)
