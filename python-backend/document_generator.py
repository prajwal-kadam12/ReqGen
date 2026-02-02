import torch
import ssl

# Bypass SSL verification for model downloads (Whisper/T5)
ssl._create_default_https_context = ssl._create_unverified_context

import gc
import re
import os
import warnings
from datetime import datetime
from transformers import T5Tokenizer, T5ForConditionalGeneration
import whisper

# Filter warnings
warnings.filterwarnings('ignore')

class SmartT5LargeDocumentGenerator:
    """
    Intelligent T5-based document generator.
    Complete pipeline: Audio -> T5 Large Summary -> Professional Documents
    Adapted from the notebook to work within the backend application.
    """
    
    def __init__(self, whisper_model=None, t5_model=None):
        """
        Initialize with T5 and Whisper models
        """
        import config
        whisper_model = whisper_model or config.WHISPER_MODEL
        t5_model = t5_model or config.SUMMARIZATION_MODEL

        # Clear memory
        torch.cuda.empty_cache()
        gc.collect()

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"🔧 Device: {self.device}")
        
        if self.device == "cuda":
            print(f"🚀 GPU: {torch.cuda.get_device_name(0)}")
            print(f"💾 GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")
        else:
            print("⚠️ WARNING: Running on CPU. This will be slow for 'large' models.")
        
        # Load Whisper
        print(f"\n📥 Loading Whisper '{whisper_model}'...")
        self.whisper_model = whisper.load_model(whisper_model, device=self.device)
        print(f"✅ Whisper {whisper_model} loaded!")
        
        # Load T5
        print(f"\n📥 Loading T5 '{t5_model}'...")
        self.tokenizer = T5Tokenizer.from_pretrained(t5_model, legacy=False)

        dtype = torch.float16 if self.device == "cuda" else torch.float32
        
        if self.device == "cuda":
            self.model = T5ForConditionalGeneration.from_pretrained(
                t5_model,
                torch_dtype=dtype,
                device_map="auto"
            )
        else:
            self.model = T5ForConditionalGeneration.from_pretrained(
                t5_model,
                torch_dtype=dtype
            ).to(self.device)
            
        print("✅ T5 loaded!")
        
        self.is_flan = "flan" in t5_model.lower()
        
        print("\n" + "="*70)
        print("✨ Smart T5 Document Generator Ready!")
        print("="*70 + "\n")

    def transcribe_audio(self, audio_path):
        """Transcribe multilingual audio to English using Whisper"""
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"❌ File not found: {audio_path}")
        
        file_size = os.path.getsize(audio_path) / (1024 * 1024)
        print(f"🎵 Audio: {os.path.basename(audio_path)} ({file_size:.2f} MB)")
        print(f"⏳ Transcribing with Whisper...")
        
        result = self.whisper_model.transcribe(
            audio_path,
            task='translate',
            language=None,
            fp16=self.device == "cuda",
            verbose=False,
            beam_size=5,
            best_of=5,
            temperature=0.0
        )
        
        lang_map = {
            'hi': 'Hindi (हिन्दी)',
            'en': 'English',
            'mr': 'Marathi (मराठी)'
        }
        
        detected = result.get('language', 'unknown')
        text = result['text'].strip()
        word_count = len(text.split())
        
        print(f"✅ Transcription complete!")
        print(f"🌍 Language: {lang_map.get(detected, detected)}")
        print(f"📝 Words: {word_count}")
        
        return {
            'text': text,
            'language': detected,
            'language_name': lang_map.get(detected, detected),
            'word_count': word_count
        }

    def calculate_adaptive_summary_length(self, word_count, strategy):
        """
        Intelligent adaptive summary length calculation
        """
        # T5-optimized strategies
        strategies = {
            'ultra_concise': {'base_ratio': 0.12, 'min_words': 12, 'max_words': 60, 'description': 'Single sentence summaries'},
            'concise': {'base_ratio': 0.20, 'min_words': 20, 'max_words': 100, 'description': 'Brief, punchy summaries'},
            'balanced': {'base_ratio': 0.30, 'min_words': 30, 'max_words': 180, 'description': 'Balanced detail and brevity'},
            'detailed': {'base_ratio': 0.45, 'min_words': 50, 'max_words': 300, 'description': 'Comprehensive coverage'},
            'comprehensive': {'base_ratio': 0.60, 'min_words': 80, 'max_words': 450, 'description': 'Extensive detail'},
            'hybrid': {'base_ratio': 0.525, 'min_words': 65, 'max_words': 375, 'description': 'Hybrid: detailed + comprehensive'}
        }
        
        config = strategies.get(strategy, strategies['balanced']) # Default to balanced if unknown
        
        # Adaptive calculation based on input length
        if word_count < 40:
            max_words = max(config['min_words'], int(word_count * 0.85))
            min_words = max(8, int(word_count * 0.5))
            ratio = 0.85
        elif word_count < 120:
            max_words = max(config['min_words'], int(word_count * 0.65))
            min_words = max(12, int(word_count * 0.35))
            ratio = 0.65
        elif word_count < 250:
            max_words = int(word_count * 0.50)
            min_words = int(word_count * 0.25)
            ratio = 0.50
        elif word_count < 600:
            max_words = int(word_count * config['base_ratio'])
            min_words = int(word_count * (config['base_ratio'] * 0.45))
            ratio = config['base_ratio']
        elif word_count < 1500:
            max_words = int(word_count * (config['base_ratio'] * 0.95))
            min_words = int(word_count * (config['base_ratio'] * 0.40))
            ratio = config['base_ratio'] * 0.95
        elif word_count < 4000:
            max_words = int(word_count * (config['base_ratio'] * 0.85))
            min_words = int(word_count * (config['base_ratio'] * 0.35))
            ratio = config['base_ratio'] * 0.85
        else:
            max_words = int(word_count * (config['base_ratio'] * 0.75))
            min_words = int(word_count * (config['base_ratio'] * 0.30))
            ratio = config['base_ratio'] * 0.75
        
        max_words = min(max_words, config['max_words'])
        max_words = max(max_words, config['min_words'])
        min_words = min(min_words, max_words - 8)
        min_words = max(min_words, 8)
        
        max_tokens = int(max_words * 1.5)
        min_tokens = int(min_words * 1.5)
        
        return {
            'max_length': max_tokens,
            'min_length': min_tokens,
            'max_words': max_words,
            'min_words': min_words,
            'ratio': ratio,
            'strategy': strategy,
            'description': config['description']
        }

    def generate_t5_summary(self, text, max_length=512, min_length=100, quality='medium', custom_instruction=None):
        """
        Generate abstractive summary using T5
        """
        beam_config = {'fast': 2, 'medium': 4, 'high': 6, 'best': 10}
        num_beams = beam_config.get(quality, 4)
        
        if custom_instruction and self.is_flan:
            input_text = f"{custom_instruction}: {text}"
        else:
            input_text = f"summarize: {text}"
        
        inputs = self.tokenizer(
            input_text,
            return_tensors="pt",
            max_length=512,
            truncation=True,
            padding=True
        ).to(self.device)
        
        with torch.no_grad():
            summary_ids = self.model.generate(
                inputs["input_ids"],
                max_length=max_length,
                min_length=min_length,
                num_beams=num_beams,
                length_penalty=1.5,
                early_stopping=True,
                no_repeat_ngram_size=3,
                repetition_penalty=1.2,
                temperature=1.0
            )
        
        summary = self.tokenizer.decode(
            summary_ids[0],
            skip_special_tokens=True,
            clean_up_tokenization_spaces=True
        )
        return summary

    def _summarize_long_text(self, text, summary_config, quality, custom_instruction):
        """Handle long texts with intelligent chunking"""
        chunk_size = 400
        words = text.split()
        chunks = [' '.join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]
        
        print(f"  📄 Processing {len(chunks)} chunk(s)...")
        
        chunk_summaries = []
        for idx, chunk in enumerate(chunks):
            chunk_words = len(chunk.split())
            if chunk_words < 25:
                continue
            
            chunk_config = self.calculate_adaptive_summary_length(chunk_words, summary_config['strategy'])
            try:
                chunk_summary = self.generate_t5_summary(
                    chunk,
                    max_length=chunk_config['max_length'],
                    min_length=chunk_config['min_length'],
                    quality=quality,
                    custom_instruction=custom_instruction
                )
                chunk_summaries.append(chunk_summary)
            except Exception as e:
                print(f"✗ Chunk error: {e}")
                continue
        
        if not chunk_summaries:
            return text[:500]
        
        combined = ' '.join(chunk_summaries)
        combined_words = len(combined.split())
        
        if len(chunks) > 1 and combined_words > summary_config['max_words']:
            try:
                final = self.generate_t5_summary(
                    combined,
                    max_length=summary_config['max_length'],
                    min_length=summary_config['min_length'],
                    quality=quality,
                    custom_instruction=custom_instruction
                )
                return final
            except:
                pass
        
        return combined

    def extract_structured_info(self, text):
        """Extract structured information from text/summary"""
        info = {
            'requirements': [],
            'decisions': [],
            'action_items': [],
            'timeline': [],
            'budget': [],
            'risks': [],
            'technical': [],
            'deliverables': [],
            'stakeholders': []
        }
        
        sentences = re.split(r'[.!?]+', text)
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence: continue
            lower = sentence.lower()
            
            if any(w in lower for w in ['require', 'need', 'must', 'should', 'shall', 'expect']):
                info['requirements'].append(sentence)
            if any(w in lower for w in ['decide', 'agreed', 'approved', 'confirmed', 'finalized']):
                info['decisions'].append(sentence)
            if any(w in lower for w in ['will', 'task', 'action', 'assign', 'responsible', 'owner']):
                info['action_items'].append(sentence)
            if any(w in lower for w in ['deadline', 'timeline', 'date', 'week', 'month', 'schedule', 'due']):
                info['timeline'].append(sentence)
            if any(w in lower for w in ['cost', 'budget', 'price', 'payment', 'fund', 'expense', '$', 'rs', 'rupee', 'inr']):
                info['budget'].append(sentence)
            if any(w in lower for w in ['risk', 'concern', 'issue', 'challenge', 'problem', 'blocker']):
                info['risks'].append(sentence)
            if any(w in lower for w in ['technical', 'technology', 'system', 'platform', 'api', 'database', 'infrastructure']):
                info['technical'].append(sentence)
            if any(w in lower for w in ['deliver', 'output', 'product', 'feature', 'component', 'milestone']):
                info['deliverables'].append(sentence)
            if any(w in lower for w in ['stakeholder', 'team', 'department', 'client', 'customer', 'vendor']):
                info['stakeholders'].append(sentence)
        
        return info

    def generate_brd(self, summary_text, structured_info, metadata):
        """Generate Business Requirements Document"""
        doc = f"""
{'='*80}
BUSINESS REQUIREMENTS DOCUMENT (BRD)
{'='*80}

Document Information:
--------------------
Project Name:     {metadata.get('project_name', 'Audio Extracted Project')}
Document Date:    {metadata.get('date', datetime.now().strftime('%Y-%m-%d'))}
Version:          {metadata.get('version', '1.0')}
Prepared By:      {metadata.get('author', 'T5 Large Audio Analysis System')}
Status:           {metadata.get('status', 'Draft - Extracted from Audio')}
Department:       {metadata.get('department', 'TBD')}
Sponsor:          {metadata.get('sponsor', 'TBD')}


1. EXECUTIVE SUMMARY
{'='*80}

{summary_text}


2. BUSINESS OBJECTIVES
{'='*80}

Based on the audio discussion, the key business objectives are:

"""
        
        # Add objectives from summary
        if structured_info['requirements']:
            for idx, req in enumerate(structured_info['requirements'][:5], 1):
                doc += f"OBJ-{idx}: {req}\n"
        else:
            doc += "Business objectives to be refined based on stakeholder review.\n"
        
        doc += f"""

3. BUSINESS REQUIREMENTS
{'='*80}

"""
        
        if structured_info['requirements']:
            for idx, req in enumerate(structured_info['requirements'], 1):
                doc += f"BR-{idx:03d}: {req}\n"
                doc += f"         Priority: {metadata.get('priority', 'Medium')}\n"
                doc += f"         Status: New\n"
                doc += f"         Source: Audio Discussion\n\n"
        else:
            doc += "Business requirements extracted from executive summary above.\n"
        
        doc += f"""

4. FUNCTIONAL REQUIREMENTS
{'='*80}

"""
        
        if structured_info['technical']:
            for idx, tech in enumerate(structured_info['technical'], 1):
                doc += f"FR-{idx:03d}: {tech}\n"
                doc += f"         Category: {metadata.get('category', 'Technical')}\n"
                doc += f"         Priority: {metadata.get('priority', 'Medium')}\n\n"
        else:
            doc += "Functional requirements to be detailed in technical specification.\n"
        
        doc += f"""

5. STAKEHOLDERS
{'='*80}

"""
        
        if structured_info['stakeholders']:
            doc += "Stakeholders identified in discussion:\n\n"
            for stakeholder in structured_info['stakeholders']:
                doc += f"• {stakeholder}\n"
        else:
            doc += f"""
Primary Stakeholders:
• Project Sponsor: {metadata.get('sponsor', 'TBD')}
• Business Owner: {metadata.get('business_owner', 'TBD')}
• Project Manager: {metadata.get('pm', 'TBD')}
• End Users: {metadata.get('end_users', 'As discussed in audio')}
"""
        
        doc += f"""

6. KEY DECISIONS
{'='*80}

"""
        
        if structured_info['decisions']:
            for idx, decision in enumerate(structured_info['decisions'], 1):
                doc += f"D{idx}. {decision}\n"
                doc += f"    Date: {metadata.get('date', 'TBD')}\n"
                doc += f"    Decision Maker: {metadata.get('decision_maker', 'TBD')}\n\n"
        else:
            doc += "Key decisions documented in executive summary.\n"
        
        doc += f"""

7. SCOPE
{'='*80}

In Scope:
"""
        
        if structured_info['deliverables']:
            for deliverable in structured_info['deliverables']:
                doc += f"• {deliverable}\n"
        else:
            doc += "• As defined in requirements above\n"
        
        doc += """

Out of Scope:
• Items not mentioned in the audio discussion
• Features to be considered for future phases

"""
        
        doc += f"""

8. TIMELINE & MILESTONES
{'='*80}

"""
        
        if structured_info['timeline']:
            for milestone in structured_info['timeline']:
                doc += f"• {milestone}\n"
        else:
            doc += f"""
Project Timeline:
• Requirements Phase: {metadata.get('req_phase', 'TBD')}
• Design Phase: {metadata.get('design_phase', 'TBD')}
• Development Phase: {metadata.get('dev_phase', 'TBD')}
• Testing Phase: {metadata.get('test_phase', 'TBD')}
• Deployment: {metadata.get('deployment', 'TBD')}
"""
        
        doc += f"""

9. BUDGET & RESOURCES
{'='*80}

"""
        
        if structured_info['budget']:
            for budget_item in structured_info['budget']:
                doc += f"• {budget_item}\n"
        else:
            doc += f"""
Estimated Budget: {metadata.get('budget', 'To be determined')}

Resource Requirements:
• Team Size: {metadata.get('team_size', 'TBD')}
• Duration: {metadata.get('duration', 'TBD')}
• External Resources: {metadata.get('external_resources', 'TBD')}
"""
        
        doc += f"""

10. RISKS & ASSUMPTIONS
{'='*80}

Risks Identified:
"""
        
        if structured_info['risks']:
            for idx, risk in enumerate(structured_info['risks'], 1):
                doc += f"{idx}. {risk}\n"
                doc += f"   Impact: {metadata.get('risk_impact', 'Medium')}\n"
                doc += f"   Mitigation: To be defined\n\n"
        else:
            doc += "Risk assessment to be conducted during project planning.\n"
        
        doc += """

Assumptions:
• Resources will be available as per project timeline
• Stakeholder approvals will be obtained in timely manner
• Technical infrastructure is available and ready

"""
        
        doc += f"""

11. DEPENDENCIES
{'='*80}

• Dependencies identified in audio discussion
• External systems and integrations as required
• Third-party services and vendors as needed


12. SUCCESS CRITERIA
{'='*80}

The project will be considered successful when:

• All business requirements are met
• System is deployed and operational
• User acceptance testing is completed successfully
• Stakeholders sign off on deliverables


13. APPROVAL
{'='*80}

This document has been reviewed and approved by:


Business Owner: _____________________    Date: ___________

Signature:      _____________________


Project Sponsor: ____________________    Date: ___________

Signature:       ____________________


{'='*80}
Document Generated from Audio Analysis using Whisper Large + FLAN-T5 Large
Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
{'='*80}
"""
        
        return doc

    def generate_purchase_order(self, summary_text, structured_info, metadata):
        """Generate Purchase Order"""
        
        doc = f"""
{'='*80}
PURCHASE ORDER
{'='*80}

PO Number:        {metadata.get('po_number', 'PO-' + datetime.now().strftime('%Y%m%d-%H%M'))}
Date:             {metadata.get('date', datetime.now().strftime('%Y-%m-%d'))}
Status:           {metadata.get('status', 'Draft - Extracted from Audio')}


VENDOR INFORMATION:
{'='*80}
Vendor Name:      {metadata.get('vendor_name', 'TBD - As per audio discussion')}
Vendor Code:      {metadata.get('vendor_code', 'TBD')}
Address:          {metadata.get('vendor_address', 'TBD')}
City/State/ZIP:   {metadata.get('vendor_location', 'TBD')}
Contact Person:   {metadata.get('vendor_contact', 'TBD')}
Phone:            {metadata.get('vendor_phone', 'TBD')}
Email:            {metadata.get('vendor_email', 'TBD')}
GST/Tax ID:       {metadata.get('vendor_gst', 'TBD')}


BUYER INFORMATION:
{'='*80}
Company Name:     {metadata.get('company_name', 'Your Company Ltd.')}
Department:       {metadata.get('department', 'Procurement')}
Address:          {metadata.get('buyer_address', 'TBD')}
City/State/ZIP:   {metadata.get('buyer_location', 'TBD')}
Contact Person:   {metadata.get('buyer_contact', metadata.get('author', 'TBD'))}
Phone:            {metadata.get('buyer_phone', 'TBD')}
Email:            {metadata.get('buyer_email', 'TBD')}


PURCHASE ORDER SUMMARY:
{'='*80}

Based on Audio Discussion:
{summary_text}


DETAILED LINE ITEMS:
{'='*80}

"""
        
        # Extract items from deliverables or requirements
        items = structured_info['deliverables'] if structured_info['deliverables'] else structured_info['requirements']
        
        doc += f"{'Item':<5} {'Description':<45} {'Qty':<8} {'Unit':<10} {'Price':<12} {'Total':<12}\n"
        doc += "-" * 100 + "\n"
        
        if items:
            for idx, item in enumerate(items[:15], 1):  # Max 15 items
                clean_item = item.replace('\n', ' ')[:42]
                doc += f"{idx:<5} {clean_item:<45} {'TBD':<8} {'Each':<10} {'TBD':<12} {'TBD':<12}\n"
        else:
            doc += f"{'1':<5} {'Items/Services as per audio discussion':<45} {'TBD':<8} {'Each':<10} {'TBD':<12} {'TBD':<12}\n"
        
        doc += "\n"
        
        doc += f"""

COST BREAKDOWN:
{'='*80}

"""
        
        if structured_info['budget']:
            doc += "Cost Details (from audio discussion):\n\n"
            for budget_item in structured_info['budget']:
                doc += f"• {budget_item}\n"
            doc += "\n"
        
        doc += f"""
Subtotal:                                                    {metadata.get('subtotal', 'TBD')}
Discount (if any):                                           {metadata.get('discount', '0.00')}
                                                             ___________
Subtotal after Discount:                                     {metadata.get('subtotal_after_discount', 'TBD')}

Tax/GST ({metadata.get('tax_rate', '18')}%):                                             {metadata.get('tax_amount', 'TBD')}
Shipping & Handling:                                         {metadata.get('shipping', 'TBD')}
Other Charges:                                               {metadata.get('other_charges', '0.00')}
                                                             ___________
TOTAL AMOUNT:                                                {metadata.get('total_amount', 'TBD')}
                                                             ===========


TERMS & CONDITIONS:
{'='*80}

Payment Terms:         {metadata.get('payment_terms', 'Net 30 Days')}
Delivery Terms:        {metadata.get('delivery_terms', 'FOB Destination')}
Expected Delivery:     {metadata.get('delivery_date', 'TBD - As per discussion')}
Delivery Address:      {metadata.get('delivery_address', 'As per buyer information above')}
Shipping Method:       {metadata.get('shipping_method', 'Standard')}
Warranty:              {metadata.get('warranty', 'As per vendor terms')}
Return Policy:         {metadata.get('return_policy', 'As per vendor terms')}


PAYMENT SCHEDULE:
{'='*80}

"""
        
        if metadata.get('payment_schedule'):
            doc += metadata['payment_schedule']
        else:
            doc += f"""
• Advance Payment: {metadata.get('advance_payment', '0%')} on PO confirmation
• Balance Payment: {metadata.get('balance_payment', '100%')} {metadata.get('payment_terms', 'Net 30')}
"""
        
        doc += f"""

SPECIAL INSTRUCTIONS:
{'='*80}

"""
        
        if structured_info['requirements']:
            doc += "Requirements from audio discussion:\n\n"
            for req in structured_info['requirements'][:5]:
                doc += f"• {req}\n"
        else:
            doc += "As per audio discussion and mutual agreement.\n"
        
        doc += f"""

ADDITIONAL NOTES:
{'='*80}

"""
        
        if structured_info['action_items']:
            doc += "Action Items:\n\n"
            for action in structured_info['action_items'][:5]:
                doc += f"• {action}\n"
        
        doc += f"""

VALIDITY:
{'='*80}

This Purchase Order is valid until: {metadata.get('validity_date', 'TBD')}


APPROVAL & AUTHORIZATION:
{'='*80}

Requested By:

Name:      {metadata.get('requested_by', 'TBD')}
Title:     {metadata.get('requested_title', 'TBD')}
Date:      {metadata.get('date', 'TBD')}
Signature: _____________________


Approved By:

Name:      {metadata.get('approved_by', 'TBD')}
Title:     {metadata.get('approved_title', 'Manager/Director')}
Date:      ___________
Signature: _____________________


Finance Approval:

Name:      {metadata.get('finance_approval', 'TBD')}
Title:     Finance Manager
Date:      ___________
Signature: _____________________


VENDOR ACCEPTANCE:
{'='*80}

We accept the terms and conditions of this Purchase Order:

Vendor Name:    {metadata.get('vendor_name', 'TBD')}
Authorized By:  _____________________
Title:          _____________________
Date:           ___________
Signature:      _____________________
Company Seal:   


{'='*80}
Purchase Order Generated from Audio Analysis
System: Whisper Large + FLAN-T5 Large
Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
{'='*80}

IMPORTANT NOTES:
- This is a preliminary document extracted from audio discussion
- Please review and verify all details before finalization
- TBD items must be filled in before final approval
- Consult legal/procurement team for compliance review
"""
        return doc

    def process_audio_smart(self, audio_path, strategy='balanced', quality='medium', custom_instruction=None, save_output=False, output_filename=None):
        """
        Complete smart pipeline with T5 adaptive summarization
        """
        print("="*70)
        print("🎯 SMART T5 AUDIO SUMMARIZER")
        print("="*70 + "\\n")
        
        # Step 1: Transcribe
        transcription = self.transcribe_audio(audio_path)
        word_count = transcription['word_count']
        
        # Step 2: Calculate smart summary length
        print(f"🧠 Calculating adaptive summary length...")
        summary_config = self.calculate_adaptive_summary_length(word_count, strategy)
        
        # Step 3: Handle very short text
        if word_count < 25:
            print("⚠️ Text very short (<25 words) - returning full transcription")
            summary = transcription['text']
            summary_words = word_count
        else:
            print(f"📊 Generating T5 summary (process_audio_smart)...")
            if word_count > 400:
                summary = self._summarize_long_text(
                    transcription['text'],
                    summary_config,
                    quality,
                    custom_instruction
                )
            else:
                summary = self.generate_t5_summary(
                    transcription['text'],
                    max_length=summary_config['max_length'],
                    min_length=summary_config['min_length'],
                    quality=quality,
                    custom_instruction=custom_instruction
                )
            summary_words = len(summary.split())
        
        results = {
            'audio_file': os.path.basename(audio_path),
            'language': transcription['language_name'],
            'transcription': transcription['text'],
            'summary': summary,
            'input_words': word_count,
            'summary_words': summary_words,
            'compression_ratio': (1 - summary_words/word_count) * 100 if word_count > 0 else 0,
            'strategy': strategy,
            'quality': quality,
            'config': summary_config
        }
        
        if save_output and output_filename:
            # Implement file saving logic if needed
            pass
            
        return results

# Global instance
_document_generator = None

def get_generator():
    global _document_generator
    if _document_generator is None:
        # Load both models for full functionality
        _document_generator = SmartT5LargeDocumentGenerator()
    return _document_generator

def generate_document(text, document_type, metadata=None):
    """
    Main function to generate documents using the smart generator from TEXT input.
    Use this if you already have text (e.g. from frontend notes).
    """
    if metadata is None:
        metadata = {}
    
    generator = get_generator()
    
    # Generate summary first to get structured info
    word_count = len(text.split())
    if word_count > 50:
        print(f"Generating abstractive summary for {word_count} words...")
        summary = generator.generate_t5_summary(
            text,
            max_length=512,
            min_length=min(100, word_count),
            quality='medium'
        )
    else:
        summary = text
        
    print(f"Extracting structured info from summary...")
    structured_info = generator.extract_structured_info(summary)
    
    # Also extract from original text (hybrid)
    raw_info = generator.extract_structured_info(text)
    for key in structured_info:
        structured_info[key].extend(raw_info[key])
        structured_info[key] = list(set(structured_info[key]))
    
    if document_type == 'brd':
        return generator.generate_brd(summary, structured_info, metadata)
    elif document_type == 'po':
        return generator.generate_purchase_order(summary, structured_info, metadata)
    else:
        raise ValueError(f"Unknown document type: {document_type}")
