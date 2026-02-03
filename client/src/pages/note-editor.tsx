import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Sparkles, FileText, Eye, Upload, Type, Mic, Square, FileAudio, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useNotifications } from "@/contexts/NotificationContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DocumentPreview } from "@/components/document-preview";
import type { InsertDocument, Settings } from "@shared/schema";

export default function NoteEditor() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [companyName, setCompanyName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [originalNote, setOriginalNote] = useState("");
  const [refinedNote, setRefinedNote] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [docType, setDocType] = useState("");
  const [highlightField, setHighlightField] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"choice" | "type">("choice");
  const [isUploading, setIsUploading] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);

  // Speech recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingLanguage, setRecordingLanguage] = useState<string>("hi"); // Default: Hindi
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const documentNameRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const docTypeRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Audio file upload states
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioStage, setAudioStage] = useState<'idle' | 'uploading' | 'transcribing' | 'complete' | 'error'>('idle');

  // Load editing document from localStorage on mount
  useEffect(() => {
    const editingDocData = localStorage.getItem('editingDocument');
    if (editingDocData) {
      try {
        const docData = JSON.parse(editingDocData);
        setEditingDocumentId(docData.id);
        setProjectName(docData.name);
        setCompanyName(docData.companyName);
        setOriginalNote(docData.content);
        setDocType(docData.type);
        setInputMode("type"); // Switch to type mode to show the content
        // Clear from localStorage after loading
        localStorage.removeItem('editingDocument');

        toast({
          title: "Editing Document",
          description: "Document loaded for editing. Update and save your changes.",
        });
      } catch (error) {
        console.error("Failed to load editing document:", error);
      }
    }
  }, [toast]);

  // ESC key handler to go back to choice screen
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && inputMode === "type") {
        setInputMode("choice");
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [inputMode]);

  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  const focusField = (fieldType: 'documentName' | 'content' | 'docType') => {
    let ref;
    if (fieldType === 'documentName') ref = documentNameRef;
    else if (fieldType === 'content') ref = contentRef;
    else if (fieldType === 'docType') ref = docTypeRef;

    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        ref.current?.focus();
      }, 300);
      setHighlightField(fieldType);
      setTimeout(() => {
        setHighlightField(null);
      }, 2000);
    }
  };

  const handleFileUpload = async (file: File) => {
    console.log("Starting file upload:", file.name, "Size:", file.size, "Type:", file.type);
    setIsUploading(true);

    // Switch to type mode immediately to show loading state
    setInputMode("type");

    try {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      console.log("File extension:", fileType);
      let text = '';

      if (fileType === 'txt') {
        console.log("Processing .txt file");
        text = await file.text();
        console.log("Extracted text length:", text.length);
      } else if (fileType === 'docx') {
        console.log("Processing .docx file");
        try {
          const mammoth = await import('mammoth');
          const arrayBuffer = await file.arrayBuffer();
          console.log("ArrayBuffer size:", arrayBuffer.byteLength);

          const result = await mammoth.extractRawText({ arrayBuffer });
          text = result.value;
          console.log("Extracted text length:", text.length);

          if (result.messages && result.messages.length > 0) {
            console.log("Mammoth messages:", result.messages);
          }

          if (!text || text.trim().length === 0) {
            console.warn("No text extracted from DOCX, trying alternative method...");
            const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlResult.value;
            text = tempDiv.textContent || tempDiv.innerText || '';
            console.log("Alternative extraction - text length:", text.length);
          }
        } catch (docxError) {
          console.error("DOCX processing error:", docxError);
          toast({
            title: "DOCX Processing Error",
            description: "Could not read the .docx file. It may be corrupted or password-protected. Try saving it again or converting to .txt",
            variant: "destructive",
          });
          return;
        }
      } else if (fileType === 'pdf') {
        console.log("Processing .pdf file");
        try {
          const pdfjsLib = await import('pdfjs-dist');

          // Use Vite's ?url syntax to import the worker properly
          const workerUrl = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
          if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.default;
            console.log("PDF.js worker configured:", workerUrl.default);
          }

          const arrayBuffer = await file.arrayBuffer();
          console.log("Loading PDF document...");

          const loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            verbosity: 0 // Suppress warnings
          });

          const pdf = await loadingTask.promise;
          console.log("PDF loaded successfully, pages:", pdf.numPages);

          let fullText = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
          }

          text = fullText;
          console.log("Extracted PDF text length:", text.length);
        } catch (pdfError: any) {
          console.error("PDF processing error:", pdfError);
          const errorMessage = pdfError?.message || "Unknown error";
          console.error("PDF error details:", errorMessage);

          toast({
            title: "PDF Processing Error",
            description: `Could not read the PDF file. ${errorMessage.includes('password') ? 'The file appears to be password-protected.' : 'It may be password-protected, image-based, or corrupted.'} Try a different file.`,
            variant: "destructive",
          });
          return;
        }
      } else if (fileType === 'doc') {
        console.log("Unsupported .doc format");
        toast({
          title: "Unsupported Format",
          description: "Please convert .doc files to .docx, .pdf, or .txt format",
          variant: "destructive",
        });
        return;
      } else {
        console.log("Unsupported file type:", fileType);
        toast({
          title: "Unsupported Format",
          description: "Please upload .txt, .docx, or .pdf files",
          variant: "destructive",
        });
        return;
      }

      if (!text || text.trim().length === 0) {
        console.warn("Extracted text is empty");
        toast({
          title: "Empty File",
          description: "No readable text found in the file. The file may be empty, image-based, or corrupted.",
          variant: "destructive",
        });
        return;
      }

      console.log("Setting originalNote with text:", text.substring(0, 100) + "...");
      setOriginalNote(text);

      toast({
        title: "File Uploaded Successfully",
        description: `Loaded ${text.length} characters from ${file.name}`,
      });
      addNotification("Document Uploaded", `Content loaded from ${file.name}`);

      console.log("File upload completed successfully");
    } catch (error) {
      console.error("File upload error details:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error message:", errorMessage);

      toast({
        title: "Upload Failed",
        description: `Failed to read file: ${errorMessage}. Please try again with a different file.`,
        variant: "destructive",
      });

      // Go back to choice screen on error
      setInputMode("choice");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
      // Reset the input so the same file can be uploaded again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Audio file upload handler
  const handleAudioFileUpload = async (file: File) => {
    console.log("Starting audio file upload:", file.name, "Size:", file.size, "Type:", file.type);
    setIsProcessingAudio(true);
    setAudioStage('uploading');
    setAudioProgress(10);
    setInputMode("type");

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('audio', file);

      // Stage 1: Uploading
      setAudioStage('transcribing');
      setAudioProgress(30);

      // Call the Python backend proxy
      const response = await fetch(`/api/python/process-audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process audio');
      }

      setAudioProgress(70);

      const data = await response.json();

      // Stage 2: Complete - Insert transcribed text into "Your Note" section
      setAudioStage('complete');
      setAudioProgress(100);

      if (data.transcript) {
        // Insert transcribed text directly into the Your Note textarea
        setOriginalNote(prev => {
          const newText = prev ? `${prev}\n\n${data.transcript}` : data.transcript;
          return newText;
        });

        addNotification("Audio Transcription Complete", `Detected: ${data.language_name || 'Unknown'} | File: ${file.name}`);
        toast({
          title: "Audio Transcribed Successfully",
          description: `Language: ${data.language_name || 'Unknown'}. Text added to notes.`,
        });
      } else {
        throw new Error('No transcription received');
      }

    } catch (err) {
      console.error('Audio processing error:', err);
      setAudioStage('error');

      let errorMessage = 'An unexpected error occurred. Make sure the Python backend is running.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }

      toast({
        title: "Audio Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessingAudio(false);
      setAudioProgress(0);
      setAudioStage('idle');
    }
  };

  const handleAudioInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleAudioFileUpload(files[0]);
      // Reset the input so the same file can be uploaded again
      if (audioInputRef.current) {
        audioInputRef.current.value = '';
      }
    }
  };

  // Speech Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      addNotification("Recording Started", "Speak now - your audio will be transcribed by AI when you stop recording");

    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Microphone Error",
        description: "Please allow microphone access to record audio",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setAudioStage('uploading');
    setAudioProgress(20);

    try {
      // Send recording to Python backend (same as audio file upload)
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      // Optionally include language hint for the backend
      if (recordingLanguage) {
        formData.append('language', recordingLanguage);
      }

      console.log('Sending recording to Python backend for transcription...');
      setAudioStage('transcribing');
      setAudioProgress(50);

      const response = await fetch(`/api/python/process-audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Transcription failed');
      }

      setAudioProgress(80);
      const data = await response.json();

      if (data.transcript) {
        // Insert transcribed text into textarea (same as audio file upload)
        setOriginalNote(prev => {
          const newText = prev ? `${prev}\n\n${data.transcript}` : data.transcript;
          return newText;
        });

        setAudioStage('complete');
        setAudioProgress(100);

        addNotification("Recording Transcribed", `Detected: ${data.language_name || 'Unknown'}`);

        toast({
          title: "Recording Transcribed",
          description: `Language: ${data.language_name || 'Unknown'}. Text added to notes.`,
        });

        // Reset states after a brief delay so user sees completion
        setTimeout(() => {
          setAudioProgress(0);
          setAudioStage('idle');
        }, 1500);
      } else {
        throw new Error('No transcription received from server');
      }

    } catch (error) {
      console.error("Recording transcription error:", error);
      setAudioStage('error');

      let errorMessage = "Failed to transcribe recording. Make sure the Python backend is running.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Transcription Failed",
        description: errorMessage,
        variant: "destructive",
      });
      // Reset states after a short delay for error
      setTimeout(() => {
        setAudioProgress(0);
        setAudioStage('idle');
      }, 2000);
    } finally {
      setIsTranscribing(false);
    }
  };

  const saveDocumentMutation = useMutation({
    mutationFn: async (data: InsertDocument) => {
      // If editing existing document, use PATCH to update
      if (editingDocumentId) {
        const response = await apiRequest("PATCH", `/api/documents/${editingDocumentId}`, data);
        return response.json();
      }
      // Otherwise create new document
      const response = await apiRequest("POST", "/api/documents", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });

      if (editingDocumentId) {
        addNotification("Document Updated", `Your ${docType.toUpperCase()} document has been updated successfully`);
        toast({
          title: "Success",
          description: "Document updated successfully!",
        });
      } else {
        addNotification("Document Generated", `Your ${docType.toUpperCase()} document has been created successfully`);
        toast({
          title: "Success",
          description: "Document saved successfully!",
        });
      }

      setShowPreview(false);
      setCompanyName("");
      setProjectName("");
      setOriginalNote("");
      setRefinedNote("");
      setDocType("");
      setInputMode("choice");
      setEditingDocumentId(null);
      setLocation("/files");
    },
    onError: () => {
      toast({
        title: "Error",
        description: editingDocumentId ? "Failed to update document. Please try again." : "Failed to save document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRefine = async () => {
    console.log("handleRefine called");

    if (!originalNote || originalNote.trim().length === 0) {
      toast({
        title: "No Content",
        description: "Please add some content before refining with AI",
        variant: "destructive",
      });
      return;
    }

    // Check minimum length (approx 50 words)
    const wordCount = originalNote.trim().split(/\s+/).length;
    if (wordCount < 50) {
      toast({
        title: "Content Too Short",
        description: `Please add more detail (at least 50 words). Current: ${wordCount} words.`,
        variant: "destructive",
      });
      return;
    }

    setIsRefining(true);
    console.log("Starting AI refinement via backend...");

    try {
      const response = await fetch(`/api/python/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: originalNote }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Refinement failed');
      }

      const data = await response.json();

      if (data.summary) {
        setRefinedNote(data.summary);
        addNotification("AI Refinement Complete", "Your notes have been refined successfully");
        toast({
          title: "Refinement Complete",
          description: "Your content has been optimized by AI.",
        });
      } else {
        throw new Error("No summary returned from AI");
      }

    } catch (error) {
      console.error("Refinement error:", error);
      toast({
        title: "Refinement Failed",
        description: error instanceof Error ? error.message : "Failed to refine content. Ensure backend is running.",
        variant: "destructive",
      });
    } finally {
      setIsRefining(false);
    }
  };

  const [generatedDocumentContent, setGeneratedDocumentContent] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDocument = async () => {
    if (!projectName.trim()) {
      focusField('documentName');
      toast({
        title: "Document Name Required",
        description: "Please enter a document name to continue",
        variant: "destructive",
      });
      return;
    }

    if (!originalNote && !refinedNote) {
      focusField('content');
      toast({
        title: "Content Required",
        description: "Please write your note before generating document",
        variant: "destructive",
      });
      return;
    }

    if (!docType) {
      focusField('docType');
      toast({
        title: "Document Type Required",
        description: "Please select a document type",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    const content = refinedNote || originalNote;

    try {
      console.log("Generating document from Python backend:", { type: docType });

      const response = await fetch(`/api/python/generate-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: content,
          document_type: docType,
          metadata: {
            project_name: projectName,
            company_name: companyName,
            author: 'ReqGen User',
            version: '1.0',
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.document) {
          setGeneratedDocumentContent(data.document);
          console.log("Document generated successfully:", data.word_count, "words");
          addNotification("Document Generated", `${docType.toUpperCase()} created with ${data.word_count} words`);
          setShowPreview(true);
        } else {
          throw new Error(data.error || "Failed to generate document");
        }
      } else {
        throw new Error("Backend API failed");
      }
    } catch (error) {
      console.error("Document generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate formatted document. Using raw content instead.",
        variant: "destructive",
      });
      // Fallback to raw content if generation fails
      setGeneratedDocumentContent(content);
      setShowPreview(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmGenerate = async () => {
    const getDocTypeName = (type: string) => {
      switch (type) {
        case "brd":
          return "Business Requirement Document";
        case "po":
          return "Purchase Order";
        default:
          return "Document";
      }
    };
    const docTypeName = getDocTypeName(docType);
    const timestamp = new Date().toISOString().split('T')[0];

    const documentName = projectName.trim() || `${docTypeName} - ${timestamp}`;

    // Use the generated content if available, otherwise fallback to original/refined note
    const finalContent = generatedDocumentContent || refinedNote || originalNote;

    await saveDocumentMutation.mutateAsync({
      name: documentName,
      type: docType,
      content: finalContent,
      originalNote,
      refinedNote: refinedNote || null,
      companyName: companyName || null,
      projectName: projectName || null,
      status: "pending" as const,
      clientMessage: null,
    });
  };


  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 bg-gradient-to-br from-primary/5 via-background to-accent/5 min-h-full">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Note Editor
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Write your requirements and refine them with AI before generating documents
        </p>
      </div>

      <Card className="shadow-lg border-2">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
          <CardTitle className="text-lg md:text-xl">Document Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                placeholder="Enter company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                data-testid="input-company-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-name">Document Name</Label>
              <Input
                ref={documentNameRef}
                id="project-name"
                placeholder="Enter document name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className={highlightField === 'documentName' ? 'ring-2 ring-destructive animate-pulse' : ''}
                data-testid="input-project-name"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card className="shadow-lg border-2">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-xl">Your Note</CardTitle>
              <div className="flex items-center gap-2">
                {isRecording && (
                  <span className="text-xs text-red-500 font-semibold animate-pulse flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    Recording...
                  </span>
                )}
                <Button
                  type="button"
                  size="icon"
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={() => {
                    if (isRecording) {
                      stopRecording();
                    } else {
                      setInputMode("type");
                      startRecording();
                    }
                  }}
                  disabled={isTranscribing}
                  title={isRecording ? "Stop Recording" : "Record Audio (Python Backend)"}
                  data-testid="button-record-speech"
                >
                  {isRecording ? (
                    <Square className="w-4 h-4 fill-current" />
                  ) : isTranscribing ? (
                    <Mic className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Your Notes</Label>

              {inputMode === "choice" ? (
                <div className="min-h-[250px] border-2 border-dashed rounded-md flex flex-col items-center justify-center gap-4 md:gap-6 p-4 md:p-8">
                  <p className="text-xs md:text-sm text-muted-foreground text-center px-2">
                    Choose how you want to add your requirements
                  </p>
                  <div className="flex flex-col gap-3 md:gap-4 w-full max-w-sm">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setInputMode("type")}
                      className="w-full h-24 md:h-28 flex flex-col gap-2 md:gap-3 hover-elevate"
                      data-testid="button-choose-type"
                    >
                      <Type className="w-8 h-8 md:w-10 md:h-10" />
                      <div className="text-center">
                        <p className="text-sm md:text-base font-semibold">Type or Paste</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Write your notes manually
                        </p>
                      </div>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-24 md:h-28 flex flex-col gap-2 md:gap-3 hover-elevate"
                      data-testid="button-choose-upload"
                    >
                      <Upload className="w-8 h-8 md:w-10 md:h-10" />
                      <div className="text-center">
                        <p className="text-sm md:text-base font-semibold">Upload Document</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Import from .txt, .docx, or .pdf
                        </p>
                      </div>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => audioInputRef.current?.click()}
                      className="w-full h-24 md:h-28 flex flex-col gap-2 md:gap-3 hover-elevate"
                      data-testid="button-choose-audio"
                    >
                      <FileAudio className="w-8 h-8 md:w-10 md:h-10" />
                      <div className="text-center">
                        <p className="text-sm md:text-base font-semibold">Upload Audio</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Transcribe audio files (MP3, WAV, M4A)
                        </p>
                      </div>
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.docx,.pdf"
                      onChange={handleFileInputChange}
                      className="hidden"
                      data-testid="input-file-upload-main"
                    />
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept=".mp3,.wav,.m4a,.ogg,.flac,.aac"
                      onChange={handleAudioInputChange}
                      className="hidden"
                      data-testid="input-audio-upload-main"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {(isUploading || isProcessingAudio || isTranscribing) ? (
                    <div className="min-h-[250px] border rounded-md p-4 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 flex flex-col items-center justify-center gap-4">
                      <div className="w-full max-w-md space-y-4">
                        <div className="flex items-center justify-center gap-2 text-primary">
                          {(isProcessingAudio || isTranscribing) ? (
                            <>
                              <Loader2 className="w-6 h-6 animate-spin" />
                              <span className="text-lg font-semibold">
                                {audioStage === 'uploading' && 'Uploading audio file...'}
                                {audioStage === 'transcribing' && 'Transcribing audio with AI...'}
                                {audioStage === 'complete' && 'Processing complete!'}
                              </span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-6 h-6 animate-bounce" />
                              <span className="text-lg font-semibold">Processing Document...</span>
                            </>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]" />
                          </div>

                          <div className="space-y-2">
                            <div className="h-3 bg-muted/60 rounded animate-pulse w-3/4" />
                            <div className="h-3 bg-muted/60 rounded animate-pulse w-full" />
                            <div className="h-3 bg-muted/60 rounded animate-pulse w-5/6" />
                            <div className="h-3 bg-muted/60 rounded animate-pulse w-2/3" />
                            <div className="h-3 bg-muted/60 rounded animate-pulse w-4/5" />
                          </div>
                        </div>

                        <p className="text-center text-sm text-muted-foreground animate-pulse">
                          {isTranscribing ? 'Converting your speech to text...' : 'Extracting and loading content...'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Textarea
                        ref={contentRef}
                        placeholder="Start writing your business requirements here...&#10;&#10;Example:&#10;- Project objective&#10;- Key stakeholders&#10;- Main features required&#10;- Timeline and budget constraints&#10;&#10;Press ESC to go back"
                        className={`min-h-[250px] resize-none ${highlightField === 'content' ? 'ring-2 ring-destructive animate-pulse' : ''}`}
                        value={originalNote}
                        onChange={(e) => setOriginalNote(e.target.value)}
                        data-testid="textarea-original-note"
                        autoFocus
                      />
                    </>
                  )}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setInputMode("choice")}
                      className="text-xs"
                      data-testid="button-back-to-choice"
                      disabled={isUploading || isProcessingAudio || isTranscribing}
                    >
                      ← Back to options
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <Button
              onClick={() => {
                console.log("Refine button clicked");
                console.log("Button state - originalNote:", !!originalNote, "isRefining:", isRefining);
                handleRefine();
              }}
              disabled={!originalNote || isRefining}
              className="w-full gap-2 shadow-lg bg-gradient-to-r from-accent to-primary hover:shadow-xl transition-all"
              data-testid="button-refine-ai"
            >
              <Sparkles className="w-4 h-4" />
              {isRefining ? "Refining..." : "Refine with AI"}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2">
          <CardHeader className="bg-gradient-to-r from-accent/10 to-transparent">
            <CardTitle className="text-xl">Refined Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>AI-Refined Version</Label>
              <Textarea
                placeholder="AI-refined version will appear here..."
                className="min-h-[250px] resize-none"
                value={refinedNote}
                onChange={(e) => setRefinedNote(e.target.value)}
                data-testid="textarea-refined-note"
              />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger
                    ref={docTypeRef}
                    className={highlightField === 'docType' ? 'ring-2 ring-destructive animate-pulse' : ''}
                    data-testid="select-document-type"
                  >
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brd">Business Requirement Document (BRD)</SelectItem>
                    <SelectItem value="po">Purchase Order (PO)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {isGenerating ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground animate-pulse">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating Document...
                    </span>
                    <span>Please wait</span>
                  </div>
                  <Progress value={33} className="w-full h-2 animate-pulse" />
                </div>
              ) : (
                <Button
                  onClick={handleGenerateDocument}
                  disabled={isGenerating}
                  className="w-full gap-2 shadow-lg bg-gradient-to-r from-primary to-accent hover:shadow-xl transition-all"
                  data-testid="button-generate-document"
                >
                  <FileText className="w-4 h-4" />
                  Generate Document
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Document Preview
            </DialogTitle>
            <DialogDescription>
              Review your document before saving
            </DialogDescription>
          </DialogHeader>
          <DocumentPreview
            docType={docType}
            content={generatedDocumentContent || refinedNote || originalNote}
            companyName={companyName}
            projectName={projectName}
            generatedAt={new Date()}
            settings={settings}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              disabled={saveDocumentMutation.isPending}
              data-testid="button-cancel-preview"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmGenerate}
              disabled={saveDocumentMutation.isPending}
              data-testid="button-confirm-save"
            >
              {saveDocumentMutation.isPending ? "Saving..." : "Confirm & Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
