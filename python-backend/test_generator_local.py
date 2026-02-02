
import sys
import os
from pathlib import Path

# Add the current directory to sys.path
sys.path.append(os.getcwd())

import document_generator
import config

def test_generator():
    print("Testing Generator Initialization...")
    try:
        generator = document_generator.get_generator()
        print("Generator loaded successfully!")
        
        # Check if we can transcribe the file in uploads if it exists
        upload_dir = Path("uploads")
        files = list(upload_dir.glob("*.m4a")) + list(upload_dir.glob("*.webm"))
        
        if files:
            audio_path = str(files[0])
            print(f"Testing transcription on: {audio_path}")
            result = generator.transcribe_audio(audio_path)
            print("Transcription Result preview:", result['text'][:100])
        else:
            print("No audio file found in uploads to test transcription.")
            
    except Exception as e:
        print(f"FAILED: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_generator()
