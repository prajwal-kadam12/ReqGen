"""
ReqGen AI Backend - FastAPI Version
No Gradio dependency - Simple REST API
"""
import os
import json
import tempfile
import traceback
import warnings
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

warnings.filterwarnings('ignore')

app = FastAPI(title="ReqGen AI Backend")

# CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
WHISPER_MODEL = "tiny"
SUMMARIZATION_MODEL = "facebook/bart-large-cnn" # Superior quality for summarization

# Global cache
_whisper_model = None
_summarizer_pipeline = None

def get_whisper():
    global _whisper_model
    if _whisper_model is None:
        import whisper
        print(f"Loading Whisper {WHISPER_MODEL}...")
        _whisper_model = whisper.load_model(WHISPER_MODEL)
        print("Whisper loaded!")
    return _whisper_model

def get_summarizer():
    global _summarizer_pipeline
    if _summarizer_pipeline is None:
        from transformers import pipeline
        print(f"Loading Summarizer {SUMMARIZATION_MODEL}...")
        # Use pipeline for BART - simplifies everything (tokenization + generation)
        _summarizer_pipeline = pipeline("summarization", model=SUMMARIZATION_MODEL)
        print("Summarizer loaded!")
    return _summarizer_pipeline

# ===== API Endpoints =====

@app.get("/")
def root():
    return {"status": "healthy", "message": "ReqGen AI Backend (Whisper + BART)", "version": "3.0"}

@app.get("/api/health")
def health():
    return {"status": "healthy", "models": {"whisper": WHISPER_MODEL, "summarizer": SUMMARIZATION_MODEL}}

@app.post("/api/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    """Transcribe audio to text"""
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            content = await audio.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        model = get_whisper()
        result = model.transcribe(tmp_path, language=None)
        
        # Cleanup
        os.unlink(tmp_path)
        
        return {
            "success": True,
            "transcript": result["text"],
            "language": result.get("language", "unknown"),
            "word_count": len(result["text"].split())
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/summarize")
async def summarize(
    text: str = Form(...),
    strategy: str = Form("balanced"),
    quality: str = Form("medium")
):
    """Summarize text using BART"""
    try:
        if not text or len(text.strip()) < 10:
            raise HTTPException(status_code=400, detail="Text too short")
        
        summarizer = get_summarizer()
        
        # Calculate optimal length constraints based on input
        input_len = len(text.split())
        max_len = min(300, max(60, int(input_len * 0.5)))
        min_len = min(50, max(20, int(input_len * 0.15)))
        
        # Determine strictness based on user preference (quality param)
        do_sample = False # Deterministic is better for factual summaries
        if quality == "high":
            num_beams = 4
        else:
            num_beams = 2 # Faster
            
        print(f"Summarizing {input_len} words. Max: {max_len}, Min: {min_len}, Beams: {num_beams}")

        # BART Pipeline handles large text automatically by truncation usually, 
        # but for very large text (>1024 tokens), we might need chunking. 
        # For now, relying on pipeline's truncation=True default.
        output = summarizer(
            text, 
            max_length=max_len, 
            min_length=min_len, 
            do_sample=False, 
            num_beams=num_beams,
            truncation=True
        )
        
        summary = output[0]['summary_text']
        
        return {
            "success": True,
            "summary": summary,
            "word_count": len(text.split()),
            "summary_word_count": len(summary.split()),
            "strategy": strategy,
            "quality": quality,
            "model": SUMMARIZATION_MODEL
        }
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/process-audio")
async def process_audio(
    audio: UploadFile = File(...),
    strategy: str = Form("balanced"),
    quality: str = Form("medium")
):
    """Transcribe + Summarize audio"""
    try:
        import torch
        
        # Save uploaded file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            content = await audio.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        # Transcribe
        model = get_whisper()
        result = model.transcribe(tmp_path, language=None)
        transcript = result["text"]
        
        # Cleanup audio file
        os.unlink(tmp_path)
        
        # Summarize if long enough
        summary = transcript
        if len(transcript.split()) > 30:
            summarizer = get_summarizer()
            
            # Dynamic length calculation
            input_len = len(transcript.split())
            max_len = min(300, max(60, int(input_len * 0.5)))
            min_len = min(50, max(20, int(input_len * 0.15)))
            
            print(f"Summarizing audio transcript ({input_len} words)...")
            
            output = summarizer(
                transcript, 
                max_length=max_len, 
                min_length=min_len, 
                do_sample=False, 
                num_beams=2,
                truncation=True
            )
            summary = output[0]['summary_text']
        
        return {
            "success": True,
            "transcript": transcript,
            "summary": summary,
            "language": result.get("language", "unknown"),
            "language_name": result.get("language", "Unknown"),
            "word_count": len(transcript.split()),
            "summary_word_count": len(summary.split()),
            "filename": audio.filename or "audio"
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-document")
async def generate_document(
    text: str = Form(...),
    document_type: str = Form("brd"),
    metadata: str = Form("{}")
):
    """Generate BRD or PO document"""
    try:
        if not text:
            raise HTTPException(status_code=400, detail="No text provided")
        
        meta = json.loads(metadata) if metadata else {}
        project = meta.get("project_name", "Project")
        company = meta.get("company_name", "Company")
        
        if document_type == "brd":
            doc = f"""BUSINESS REQUIREMENTS DOCUMENT
================================
Project: {project}
Company: {company}
Date: {datetime.now().strftime("%Y-%m-%d")}

REQUIREMENTS:
{text}

OBJECTIVES:
- Implement described functionality
- Meet business goals
"""
        else:
            doc = f"""PURCHASE ORDER
==============
PO#: PO-{datetime.now().strftime("%Y%m%d%H%M%S")}
Date: {datetime.now().strftime("%Y-%m-%d")}

ITEMS:
{text}
"""
        
        return {
            "success": True,
            "document": doc,
            "document_type": document_type,
            "filename": f"{document_type}_{datetime.now().strftime('%Y%m%d')}.txt"
        }
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Run with uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
