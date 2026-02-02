"""
Configuration settings for the Audio Transcription Backend
"""
import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent

# Upload settings
UPLOAD_FOLDER = BASE_DIR / 'uploads'
UPLOAD_FOLDER.mkdir(exist_ok=True)

# Maximum file size (100MB)
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB in bytes

# Allowed audio file extensions
ALLOWED_EXTENSIONS = {'.mp3', '.wav', '.m4a', '.ogg', '.flac', '.aac', '.wma', '.webm'}

# Model settings
WHISPER_MODEL = "small"  # Options: tiny, base, small, medium, large
SUMMARIZATION_MODEL = "google/flan-t5-base"

# Whisper settings
CHUNK_LENGTH_S = 30  # Chunk length for long-form transcription
SAMPLING_RATE = 16000  # Required sampling rate for Whisper

# Summarization settings
SUMMARY_MAX_LENGTH = 512
SUMMARY_MIN_LENGTH = 100

# Adaptive summarization settings
SUMMARY_RATIO = 0.60  # Default ratio for 'comprehensive' strategy
SUMMARY_MIN_WORDS = 25  # Minimum words to attempt summarization
SUMMARY_MAX_WORDS = 450  # Maximum summary length for 'comprehensive'

# Chunking settings for long audio
CHUNK_SIZE_WORDS = 400  # Words per chunk (T5 optimal)

# Flask settings
FLASK_HOST = "127.0.0.1"  # Changed from 0.0.0.0 to avoid permission issues
FLASK_PORT = 5001  # Changed from 5000 to avoid conflicts
DEBUG = os.getenv("FLASK_DEBUG", "False").lower() == "true"

# CORS settings - Allow requests from the frontend
CORS_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternative React dev server
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://localhost:5001",  # Flask dev server
    "http://127.0.0.1:5001",
    "http://localhost:5027",  # Node.js server
    "http://127.0.0.1:5027"
]
