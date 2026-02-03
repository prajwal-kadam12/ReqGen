"""
Flask Backend for Audio Transcription and Summarization
Provides REST API endpoints for:
- Audio transcription using OpenAI Whisper
- Text summarization using T5 Large
- Document Generation (BRD/PO) using T5 Large
"""
import os
import traceback
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import config
import document_generator

app = Flask(__name__)
# CORS(app, resources={r"/api/*": {"origins": "*"}})  # Allow all origins for testing
CORS(app) # Enable CORS for all routes for simplicity

# Global variable to cache generator (loaded via document_generator)

def allowed_file(filename):
    """Check if file has an allowed extension"""
    return Path(filename).suffix.lower() in config.ALLOWED_EXTENSIONS

@app.route('/', methods=['GET'])
def index():
    """Root endpoint to verify backend is running"""
    print("Health check probe received at root /")
    return "Python Backend is Running! Access /api/health for status.", 200

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Smart T5 Audio Backend is running',
        'backend': 'SmartT5LargeDocumentGenerator'
    }), 200

@app.route('/api/test-upload', methods=['POST'])
def test_upload():
    """Simple test endpoint to verify file upload works without AI"""
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided', 'files_received': list(request.files.keys())}), 400
        
        file = request.files['audio']
        return jsonify({
            'success': True,
            'message': 'File received successfully (no AI processing)',
            'filename': file.filename,
            'content_type': file.content_type,
            'size': len(file.read())
        }), 200
    except Exception as e:
        return jsonify({'error': 'Test upload failed', 'details': str(e)}), 500

@app.route('/api/transcribe', methods=['POST'])
def transcribe_audio():
    """
    Transcribe an audio file using Whisper
    """
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        file = request.files['audio']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': f'Invalid file type. Allowed: {", ".join(config.ALLOWED_EXTENSIONS)}'}), 400
        
        filename = secure_filename(file.filename)
        file_path = config.UPLOAD_FOLDER / filename
        file.save(file_path)
        
        try:
            generator = document_generator.get_generator()
            result = generator.transcribe_audio(str(file_path))
            
            return jsonify({
                'success': True,
                'transcript': result['text'],
                'language': result['language'],
                'language_name': result.get('language_name', 'Unknown'),
                'word_count': result['word_count'],
                'filename': filename
            }), 200
            
        finally:
            if file_path.exists():
                file_path.unlink()
    
    except Exception as e:
        print(f"Error during transcription: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Transcription failed', 'details': str(e)}), 500

@app.route('/api/summarize', methods=['POST'])
def summarize_text():
    """
    Summarize text input using T5
    """
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text'].strip()
        strategy = data.get('strategy', 'balanced')
        quality = data.get('quality', 'medium')
        
        generator = document_generator.get_generator()
        
        # Use generator's logic (mimicking process_audio_smart steps for text only)
        word_count = len(text.split())
        
        # Adaptive settings
        summary_config = generator.calculate_adaptive_summary_length(word_count, strategy)
        
        if word_count < 25:
            summary = text
        elif word_count > 400:
             summary = generator._summarize_long_text(text, summary_config, quality, None)
        else:
            summary = generator.generate_t5_summary(
                text, 
                max_length=summary_config['max_length'],
                min_length=summary_config['min_length'],
                quality=quality
            )
            
        return jsonify({
            'success': True,
            'summary': summary,
            'word_count': word_count,
            'summary_word_count': len(summary.split()),
            'strategy': strategy,
            'quality': quality
        }), 200
    
    except Exception as e:
        print(f"Error during summarization: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Summarization failed', 'details': str(e)}), 500

@app.route('/api/process-audio', methods=['POST'])
def process_audio():
    """
    Process audio file: transcribe AND summarize using SmartT5 pipeline
    """
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        file = request.files['audio']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': f'Invalid file type. Allowed: {", ".join(config.ALLOWED_EXTENSIONS)}'}), 400
        
        filename = secure_filename(file.filename)
        file_path = config.UPLOAD_FOLDER / filename
        file.save(file_path)
        
        try:
            data = request.form.to_dict() # Parameters might be sent in form-data for file uploads
            strategy = data.get('strategy', 'balanced')
            quality = data.get('quality', 'medium')
            custom_instruction = data.get('custom_instruction')

            print(f"--- Audio Processing Started: {filename} ---")
            print(f"Strategy: {strategy}, Quality: {quality}")
            
            print("Step 1: Getting generator (initializing if first time)...")
            generator = document_generator.get_generator()
            
            # Use process_audio_smart from the notebook logic
            print("Step 2: Processing audio (Transcribe + Summarize)...")
            results = generator.process_audio_smart(
                audio_path=str(file_path),
                strategy=strategy,
                quality=quality,
                custom_instruction=custom_instruction
            )
            print("Step 3: Processing complete.")
            
            # Map keys to expected frontend response
            return jsonify({
                'success': True,
                'transcript': results['transcription'],
                'summary': results['summary'],
                'language': 'unknown', # Whisper language code might be hidden in language name, but this is fine
                'language_name': results['language'],
                'word_count': results['input_words'],
                'summary_word_count': results['summary_words'],
                'filename': filename
            }), 200
            
        finally:
            if file_path.exists():
                file_path.unlink()
    
    except Exception as e:
        print(f"Error during audio processing: {str(e)}")
        traceback.print_exc()
        
        # Log to a specific file for audio errors
        try:
            with open('audio_errors.log', 'a') as f:
                f.write(f"\n--- {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ---\n")
                f.write(f"File: {filename}\n")
                f.write(traceback.format_exc())
                f.write("-" * 50 + "\n")
        except:
            pass

        return jsonify({'error': 'Audio processing failed', 'details': str(e)}), 500

@app.route('/api/models/preload', methods=['POST'])
def preload_models():
    """
    Preload models into memory
    """
    try:
        document_generator.get_generator()
        return jsonify({'success': True, 'message': 'Models preloaded successfully'}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to preload models', 'details': str(e)}), 500

@app.route('/api/generate-document', methods=['POST'])
def generate_document_api():
    """
    Generate BRD or Purchase Order document from text
    """
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text'].strip()
        document_type = data.get('document_type', 'brd')
        metadata = data.get('metadata', {})
        
        if not text:
            return jsonify({'error': 'Text cannot be empty'}), 400
        
        if document_type not in ['brd', 'po']:
            return jsonify({'error': f'Invalid document type: {document_type}. Use "brd" or "po"'}), 400
        
        print(f"Generating {document_type.upper()} document...")
        
        # Generate the document
        generated_doc = document_generator.generate_document(
            text=text,
            document_type=document_type,
            metadata=metadata
        )
        
        from datetime import datetime
        project_name = metadata.get('project_name', 'document').replace(' ', '_')
        filename = f"{document_type}_{project_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        
        return jsonify({
            'success': True,
            'document': generated_doc,
            'document_type': document_type,
            'filename': filename,
            'word_count': len(generated_doc.split())
        }), 200
    
    except Exception as e:
        print(f"Error during document generation: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Document generation failed', 'details': str(e)}), 500

if __name__ == '__main__':
    print("=" * 60)
    print("Smart T5 Audio Backend")
    print("=" * 60)
    print(f"Server starting on http://{config.FLASK_HOST}:{config.FLASK_PORT}")
    
    # Preload models on startup
    try:
        print("Preloading models (Whisper + T5)...")
        document_generator.get_generator()
        print("Model preloading complete.")
    except Exception as e:
        print(f"Warning: Model preload failed: {e}")
        traceback.print_exc()
        
    app.run(
        host=config.FLASK_HOST,
        port=config.FLASK_PORT,
        debug=config.DEBUG
    )
