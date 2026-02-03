"""
ReqGen AI Backend for Hugging Face Spaces
Audio transcription (Whisper) + Text summarization (T5) + Document generation
"""
import os
import gc
import re
import ssl
import json
import tempfile
import traceback
import warnings
from datetime import datetime
from pathlib import Path

import torch
import whisper
import gradio as gr
from transformers import T5Tokenizer, T5ForConditionalGeneration

# Bypass SSL verification for model downloads
ssl._create_default_https_context = ssl._create_unverified_context
warnings.filterwarnings('ignore')

# Configuration
WHISPER_MODEL = "tiny"  # Smallest for faster loading
T5_MODEL = "google/flan-t5-small"  # Small but capable

# Global model cache
_whisper_model = None
_t5_tokenizer = None
_t5_model = None
_device = None

def get_device():
    global _device
    if _device is None:
        _device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Device: {_device}")
    return _device

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        print(f"Loading Whisper {WHISPER_MODEL}...")
        _whisper_model = whisper.load_model(WHISPER_MODEL, device=get_device())
        print("Whisper loaded!")
    return _whisper_model

def get_t5_model():
    global _t5_tokenizer, _t5_model
    if _t5_tokenizer is None:
        print(f"Loading T5 {T5_MODEL}...")
        _t5_tokenizer = T5Tokenizer.from_pretrained(T5_MODEL)
        _t5_model = T5ForConditionalGeneration.from_pretrained(T5_MODEL)
        _t5_model.to(get_device())
        _t5_model.eval()
        print("T5 loaded!")
    return _t5_tokenizer, _t5_model

# ===== API Functions =====

def transcribe_audio(audio_path):
    """Transcribe audio to text using Whisper"""
    try:
        if audio_path is None:
            return json.dumps({"error": "No audio file provided"})
        
        model = get_whisper_model()
        result = model.transcribe(audio_path, language=None)  # Auto-detect language
        
        return json.dumps({
            "success": True,
            "transcript": result["text"],
            "language": result.get("language", "unknown"),
            "word_count": len(result["text"].split())
        })
    except Exception as e:
        traceback.print_exc()
        return json.dumps({"error": str(e)})

def summarize_text(text, strategy="balanced", quality="medium"):
    """Summarize text using T5"""
    try:
        if not text or len(text.strip()) < 10:
            return json.dumps({"error": "Text too short to summarize"})
        
        tokenizer, model = get_t5_model()
        
        # Prepare prompt
        prompt = f"summarize: {text}"
        
        # Encode
        inputs = tokenizer.encode(prompt, return_tensors="pt", max_length=512, truncation=True)
        inputs = inputs.to(get_device())
        
        # Generate
        with torch.no_grad():
            outputs = model.generate(
                inputs,
                max_length=256,
                min_length=50,
                num_beams=4,
                length_penalty=2.0,
                early_stopping=True
            )
        
        summary = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        return json.dumps({
            "success": True,
            "summary": summary,
            "word_count": len(text.split()),
            "summary_word_count": len(summary.split()),
            "strategy": strategy,
            "quality": quality
        })
    except Exception as e:
        traceback.print_exc()
        return json.dumps({"error": str(e)})

def process_audio(audio_path, strategy="balanced", quality="medium"):
    """Combined transcription + summarization"""
    try:
        if audio_path is None:
            return json.dumps({"error": "No audio file provided"})
        
        # Step 1: Transcribe
        model = get_whisper_model()
        result = model.transcribe(audio_path, language=None)
        transcript = result["text"]
        
        # Step 2: Summarize
        tokenizer, t5_model = get_t5_model()
        prompt = f"summarize: {transcript}"
        inputs = tokenizer.encode(prompt, return_tensors="pt", max_length=512, truncation=True)
        inputs = inputs.to(get_device())
        
        with torch.no_grad():
            outputs = t5_model.generate(
                inputs,
                max_length=256,
                min_length=50,
                num_beams=4,
                length_penalty=2.0,
                early_stopping=True
            )
        
        summary = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        return json.dumps({
            "success": True,
            "transcript": transcript,
            "summary": summary,
            "language": result.get("language", "unknown"),
            "language_name": result.get("language", "Unknown"),
            "word_count": len(transcript.split()),
            "summary_word_count": len(summary.split()),
            "filename": os.path.basename(audio_path) if audio_path else "audio"
        })
    except Exception as e:
        traceback.print_exc()
        return json.dumps({"error": str(e)})

def generate_document(text, document_type="brd", metadata_json="{}"):
    """Generate BRD or Purchase Order document"""
    try:
        if not text:
            return json.dumps({"error": "No text provided"})
        
        metadata = json.loads(metadata_json) if metadata_json else {}
        project_name = metadata.get("project_name", "Project")
        company_name = metadata.get("company_name", "Company")
        
        if document_type == "brd":
            doc = f"""
BUSINESS REQUIREMENTS DOCUMENT (BRD)
=====================================
Project: {project_name}
Company: {company_name}
Date: {datetime.now().strftime("%Y-%m-%d")}

1. EXECUTIVE SUMMARY
{text[:500]}...

2. BUSINESS OBJECTIVES
Based on the requirements provided, the key objectives are:
- Implement the described functionality
- Ensure user satisfaction
- Meet business goals

3. SCOPE
This document covers the requirements as described in the input.

4. REQUIREMENTS
{text}

5. TIMELINE
To be determined based on complexity analysis.

6. STAKEHOLDERS
- Project Manager
- Development Team
- End Users
"""
        else:  # Purchase Order
            doc = f"""
PURCHASE ORDER
===============
PO Number: PO-{datetime.now().strftime("%Y%m%d%H%M%S")}
Date: {datetime.now().strftime("%Y-%m-%d")}
Company: {company_name}

ITEMS/SERVICES:
{text}

TERMS AND CONDITIONS:
- Standard payment terms apply
- Delivery as per agreement
"""
        
        filename = f"{document_type}_{project_name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        
        return json.dumps({
            "success": True,
            "document": doc,
            "document_type": document_type,
            "filename": filename,
            "word_count": len(doc.split())
        })
    except Exception as e:
        traceback.print_exc()
        return json.dumps({"error": str(e)})

def health_check():
    """Health check endpoint"""
    return json.dumps({
        "status": "healthy",
        "message": "ReqGen AI Backend is running on Hugging Face Spaces",
        "backend": "Whisper + T5",
        "device": get_device()
    })

# ===== Gradio Interface =====

with gr.Blocks(title="ReqGen AI Backend") as demo:
    gr.Markdown("# 🎙️ ReqGen AI Backend")
    gr.Markdown("Audio transcription and text summarization API")
    
    with gr.Tab("🎤 Transcribe Audio"):
        audio_input = gr.Audio(type="filepath", label="Upload Audio")
        transcribe_btn = gr.Button("Transcribe", variant="primary")
        transcribe_output = gr.Textbox(label="Result (JSON)", lines=10)
        transcribe_btn.click(transcribe_audio, inputs=[audio_input], outputs=[transcribe_output])
    
    with gr.Tab("📝 Summarize Text"):
        text_input = gr.Textbox(label="Input Text", lines=5)
        strategy_input = gr.Dropdown(["balanced", "concise", "detailed"], value="balanced", label="Strategy")
        quality_input = gr.Dropdown(["low", "medium", "high"], value="medium", label="Quality")
        summarize_btn = gr.Button("Summarize", variant="primary")
        summarize_output = gr.Textbox(label="Result (JSON)", lines=10)
        summarize_btn.click(summarize_text, inputs=[text_input, strategy_input, quality_input], outputs=[summarize_output])
    
    with gr.Tab("🔄 Process Audio (Transcribe + Summarize)"):
        audio_input2 = gr.Audio(type="filepath", label="Upload Audio")
        strategy_input2 = gr.Dropdown(["balanced", "concise", "detailed"], value="balanced", label="Strategy")
        quality_input2 = gr.Dropdown(["low", "medium", "high"], value="medium", label="Quality")
        process_btn = gr.Button("Process", variant="primary")
        process_output = gr.Textbox(label="Result (JSON)", lines=15)
        process_btn.click(process_audio, inputs=[audio_input2, strategy_input2, quality_input2], outputs=[process_output])
    
    with gr.Tab("📄 Generate Document"):
        doc_text_input = gr.Textbox(label="Input Text", lines=5)
        doc_type_input = gr.Dropdown(["brd", "po"], value="brd", label="Document Type")
        metadata_input = gr.Textbox(label="Metadata (JSON)", value='{"project_name": "My Project", "company_name": "My Company"}')
        generate_btn = gr.Button("Generate", variant="primary")
        generate_output = gr.Textbox(label="Result (JSON)", lines=15)
        generate_btn.click(generate_document, inputs=[doc_text_input, doc_type_input, metadata_input], outputs=[generate_output])
    
    with gr.Tab("❤️ Health Check"):
        health_btn = gr.Button("Check Health", variant="secondary")
        health_output = gr.Textbox(label="Status", lines=5)
        health_btn.click(health_check, inputs=[], outputs=[health_output])

# Launch
if __name__ == "__main__":
    demo.launch()
