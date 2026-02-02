# Python Backend - Audio Transcription & Summarization

AI-powered audio transcription and text summarization service using state-of-the-art models.

## Features

- 🎙️ **Audio Transcription** - Convert speech to text using OpenAI's Whisper model
- 📝 **AI Summarization** - Generate concise summaries using Facebook's BART model
- 🌐 **Multi-format Support** - MP3, WAV, M4A, OGG, FLAC, AAC
- ⚡ **Fast Processing** - Optimized for both CPU and GPU
- 🔒 **File Validation** - Size and format checking
- 📊 **RESTful API** - Easy integration with any frontend

## Quick Start

### Option 1: Using the Batch File (Windows)
```bash
# Simply double-click or run:
start-backend.bat
```

### Option 2: Manual Start
```bash
# Install dependencies (first time only)
pip install -r requirements.txt

# Run the server
python app.py
```

Server will start on `http://localhost:5000`

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/transcribe` - Transcribe audio to text
- `POST /api/summarize` - Summarize text
- `POST /api/process-audio` - Transcribe + Summarize (combined)
- `POST /api/models/preload` - Preload models into memory

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for detailed usage.

## Models Used

### Whisper (Speech Recognition)
- **Model:** openai/whisper-base
- **Size:** ~290MB
- **Languages:** Multi-lingual support
- **Accuracy:** High-quality transcription

### BART (Summarization)
- **Model:** facebook/bart-large-cnn
- **Size:** ~1.6GB
- **Purpose:** Abstractive text summarization
- **Output:** Concise, coherent summaries

## Configuration

Edit `config.py` to customize:

```python
# Model selection
WHISPER_MODEL = "openai/whisper-base"
SUMMARIZATION_MODEL = "facebook/bart-large-cnn"

# File limits
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB
ALLOWED_EXTENSIONS = {'.mp3', '.wav', '.m4a', '.ogg', '.flac'}

# Server settings
FLASK_HOST = "0.0.0.0"
FLASK_PORT = 5000
```

## Project Structure

```
python-backend/
├── app.py                  # Flask application
├── config.py               # Configuration settings
├── requirements.txt        # Python dependencies
├── uploads/               # Temporary file storage (auto-created)
├── API_DOCUMENTATION.md   # API reference
└── README.md             # This file
```

## Requirements

- Python 3.8+
- 2GB+ free disk space (for models)
- Internet connection (first-time model download)

## Setup Guide

See [PYTHON_SETUP.md](../PYTHON_SETUP.md) for detailed installation and troubleshooting.

## Performance

**CPU Processing:**
- 1 min audio: ~30-60 seconds
- Summarization: ~5-10 seconds

**GPU Processing (NVIDIA CUDA):**
- 5-10x faster than CPU
- Requires CUDA-enabled PyTorch

## Example Usage

### cURL
```bash
curl -X POST http://localhost:5000/api/process-audio \
  -F "audio=@meeting.mp3"
```

### JavaScript
```javascript
const formData = new FormData();
formData.append('audio', audioFile);

const response = await fetch('http://localhost:5000/api/process-audio', {
  method: 'POST',
  body: formData,
});

const { transcript, summary } = await response.json();
```

### Python
```python
import requests

with open('audio.mp3', 'rb') as f:
    files = {'audio': f}
    response = requests.post(
        'http://localhost:5000/api/process-audio',
        files=files
    )
    data = response.json()
    print(data['transcript'])
    print(data['summary'])
```

## Security Notes

⚠️ **This is a development server.** For production:

1. Use HTTPS
2. Implement authentication
3. Add rate limiting
4. Use production WSGI server (gunicorn)
5. Set up proper logging
6. Implement file cleanup cron jobs

## License

Part of the ReqGen project.

## Support

For issues or questions, see the main project documentation.
