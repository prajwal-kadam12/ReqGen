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
T5_MODEL = "google/flan-t5-base" # Upgraded from small for better quality

# Global cache
_whisper_model = None
_t5_tokenizer = None
_t5_model = None

def get_whisper():
    global _whisper_model
    if _whisper_model is None:
        import whisper
        print(f"Loading Whisper {WHISPER_MODEL}...")
        _whisper_model = whisper.load_model(WHISPER_MODEL)
        print("Whisper loaded!")
    return _whisper_model

def get_t5():
    global _t5_tokenizer, _t5_model
    if _t5_tokenizer is None:
        import torch
        from transformers import T5Tokenizer, T5ForConditionalGeneration
        print(f"Loading T5 {T5_MODEL}...")
        _t5_tokenizer = T5Tokenizer.from_pretrained(T5_MODEL)
        _t5_model = T5ForConditionalGeneration.from_pretrained(T5_MODEL)
        _t5_model.eval()
        print("T5 loaded!")
    return _t5_tokenizer, _t5_model

# ===== API Endpoints =====

@app.get("/")
def root():
    return {"status": "healthy", "message": "ReqGen AI Backend", "version": "2.0"}

@app.get("/api/health")
def health():
    return {"status": "healthy", "models": {"whisper": WHISPER_MODEL, "t5": T5_MODEL}}

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
    """Summarize text"""
    try:
        import torch
        if not text or len(text.strip()) < 10:
            raise HTTPException(status_code=400, detail="Text too short")
        
        tokenizer, model = get_t5()
        # "summarize: " is standard for T5-flan, but we want detail
        prompt = f"detailed summary: {text}" 
        inputs = tokenizer.encode(prompt, return_tensors="pt", max_length=1024, truncation=True)
        
        with torch.no_grad():
            outputs = model.generate(
                inputs, 
                max_length=300, 
                min_length=50, 
                num_beams=2,                # Back to 2 for speed/memory
                repetition_penalty=2.0,     # Keep penalty
                no_repeat_ngram_size=3,     
                length_penalty=2.0,         # Stronger length encouragement
                early_stopping=True
            )
        
        summary = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        return {
            "success": True,
            "summary": summary,
            "word_count": len(text.split()),
            "summary_word_count": len(summary.split()),
            "strategy": strategy,
            "quality": quality
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
            tokenizer, t5_model = get_t5()
            prompt = f"detailed summary: {transcript}"
            inputs = tokenizer.encode(prompt, return_tensors="pt", max_length=1024, truncation=True)
            with torch.no_grad():
                outputs = t5_model.generate(
                    inputs, 
                    max_length=300, 
                    min_length=50, 
                    num_beams=2,            # Back to 2
                    repetition_penalty=2.0, 
                    no_repeat_ngram_size=3,
                    length_penalty=2.0,
                    early_stopping=True
                )
            summary = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
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
