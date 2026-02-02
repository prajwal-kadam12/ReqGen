# Python Backend Setup Guide

This guide will help you set up and run the Python Flask backend for audio transcription and summarization.

## Prerequisites

- **Python 3.8 or higher** installed on your system
- **pip** (Python package manager)
- At least **2GB of free disk space** for AI models
- Stable internet connection for first-time model download

## Installation Steps

### 1. Navigate to the Python Backend Directory

```bash
cd python-backend
```

### 2. Create a Virtual Environment (Recommended)

**Windows:**
```bash
python -m venv venv
.\venv\Scripts\activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

**Note:** This will install:
- Flask (web framework)
- Flask-CORS (cross-origin requests)
- transformers (Hugging Face AI models)
- torch (PyTorch deep learning library)
- librosa (audio processing)
- soundfile (audio file handling)

### 4. First-Time Model Download

The first time you run the server or process audio, the following models will be automatically downloaded:

- **Whisper Base** (~290MB) - Speech recognition
- **BART Large CNN** (~1.6GB) - Text summarization

**Total Download:** ~1.9GB

This is a one-time download. Models are cached locally for future use.

## Running the Backend

### Start the Server

```bash
python app.py
```

You should see:

```
============================================================
Audio Transcription & Summarization Backend
============================================================
Server starting on http://0.0.0.0:5000
Whisper Model: openai/whisper-base
Summarization Model: facebook/bart-large-cnn
Upload folder: [...]/uploads
Max file size: 100 MB
============================================================

Note: Models will be downloaded on first use if not cached.
This requires ~1.9GB and may take 3-5 minutes.

 * Running on http://0.0.0.0:5000
```

The server is now ready to accept requests!

## Testing the Backend

### Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "Audio Transcription Backend is running",
  "models_loaded": {
    "transcription": false,
    "summarization": false
  }
}
```

### Test Audio Transcription

```bash
curl -X POST http://localhost:5000/api/process-audio \
  -F "audio=@/path/to/your/audio.mp3"
```

## Configuration

Edit `config.py` to customize:

### Model Selection

```python
WHISPER_MODEL = "openai/whisper-base"  # Options: tiny, base, small, medium, large
SUMMARIZATION_MODEL = "facebook/bart-large-cnn"
```

**Model Size Comparison:**

| Model | Size | Speed | Accuracy |
|-------|------|-------|----------|
| whisper-tiny | 39MB | Fastest | Good |
| whisper-base | 290MB | Fast | Better |
| whisper-small | 466MB | Medium | Great |
| whisper-medium | 1.5GB | Slow | Excellent |
| whisper-large | 3GB | Slowest | Best |

### File Upload Limits

```python
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB
ALLOWED_EXTENSIONS = {'.mp3', '.wav', '.m4a', '.ogg', '.flac', '.aac'}
```

### CORS Origins

```python
CORS_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",
]
```

## Troubleshooting

### Issue: "No module named 'flask'"

**Solution:** Activate virtual environment and reinstall dependencies
```bash
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Issue: Model download is very slow

**Solution:** The models are large. Ensure stable internet connection. Download continues from where it left off if interrupted.

### Issue: "CUDA out of memory" error

**Solution:** The code automatically falls back to CPU if GPU memory is insufficient. You can also use a smaller Whisper model:
```python
WHISPER_MODEL = "openai/whisper-tiny"  # or "openai/whisper-small"
```

### Issue: Transcription is too slow on CPU

**Solutions:**
1. Use a smaller Whisper model (tiny or small)
2. Reduce audio file length
3. If you have an NVIDIA GPU, install CUDA-enabled PyTorch:
   ```bash
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
   ```

### Issue: Port 5000 already in use

**Solution:** Change the port in `config.py`:
```python
FLASK_PORT = 5001  # or any other available port
```

Then update frontend `.env`:
```
VITE_PYTHON_BACKEND_URL=http://localhost:5001
```

### Issue: Audio file format not supported

**Solution:** Convert your audio to a supported format:
- Use online converters (e.g., CloudConvert)
- Use FFmpeg: `ffmpeg -i input.xxx output.mp3`

## Performance Tips

1. **Use WAV files at 16kHz** for best results
2. **Keep audio files under 10 minutes** for faster processing
3. **Preload models** on server startup:
   ```bash
   curl -X POST http://localhost:5000/api/models/preload
   ```
4. **Use GPU** if available for 5-10x speedup

## Production Deployment

For production use:

1. Use **gunicorn** instead of Flask development server:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

2. Set up **nginx** as reverse proxy

3. Use **environment variables** for configuration

4. Implement **rate limiting** and **authentication**

5. Set up **logging** and **monitoring**

## Stopping the Server

Press `Ctrl+C` in the terminal to stop the server.

## Getting Help

- Check the [API Documentation](python-backend/API_DOCUMENTATION.md)
- Review error logs in the terminal
- Ensure all dependencies are correctly installed
