import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema, insertSettingsSchema } from "@shared/schema";
import { sendEmail } from "./email";
import htmlPdf from "html-pdf-node";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import { promises as fs } from "fs";
import path from "path";
import { tmpdir } from "os";

// Temporary user credentials (will be moved to database later)
const TEMP_USERS = [
  {
    email: "analyst@reqgen.com",
    password: "analyst123",
    role: "analyst",
    name: "Business Analyst"
  },
  {
    email: "admin@reqgen.com",
    password: "admin123",
    role: "admin",
    name: "System Administrator"
  },
  {
    email: "client@reqgen.com",
    password: "client123",
    role: "client",
    name: "Client User"
  }
];

// Authorization middleware
function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.headers['x-user-role'] as string;

    if (!userRole) {
      res.status(401).json({ error: "Unauthorized - No user role provided" });
      return;
    }

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({ error: "Forbidden - Insufficient permissions" });
      return;
    }

    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Login route
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password, role } = req.body;

      // Use storage layer to authenticate user
      const user = await storage.login(email, password, role);

      if (!user) {
        res.status(401).json({ error: "Invalid email, password, or role" });
        return;
      }

      // Successful login
      res.json({
        success: true,
        user: {
          email: user.email,
          role: user.role,
          name: user.name
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Document routes (only admin and analyst can create)
  app.post("/api/documents", requireRole(['admin', 'analyst']), async (req, res) => {
    try {
      const validatedData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(validatedData);
      res.json(document);
    } catch (error) {
      res.status(400).json({ error: "Invalid document data" });
    }
  });

  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        res.status(404).json({ error: "Document not found" });
        return;
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  app.patch("/api/documents/:id", requireRole(['admin', 'analyst', 'client']), async (req, res) => {
    try {
      const userRole = req.headers['x-user-role'] as string;
      const userName = req.headers['x-user-name'] as string;
      let updateData = req.body;
      let shouldCreateNotification = false;
      let notificationTitle = "";
      let notificationMessage = "";

      if (userRole === 'client') {
        const allowedStatuses = ['approved', 'needs_changes', 'pending'];
        if (updateData.status && !allowedStatuses.includes(updateData.status)) {
          res.status(400).json({ error: "Invalid status value" });
          return;
        }
        updateData = {
          status: updateData.status,
          clientMessage: updateData.clientMessage || null
        };

        // Create notification when client approves or requests changes
        if (updateData.status === 'approved' || updateData.status === 'needs_changes') {
          shouldCreateNotification = true;
          if (updateData.status === 'approved') {
            notificationTitle = "Document Approved";
            notificationMessage = `Document has been approved by client`;
          } else {
            notificationTitle = "Changes Requested";
            notificationMessage = `Client has requested changes to the document`;
          }
        }
      }

      const document = await storage.updateDocument(req.params.id, updateData, userName, userRole);
      if (!document) {
        res.status(404).json({ error: "Document not found" });
        return;
      }

      // Create notification for admin and analyst users
      if (shouldCreateNotification) {
        await storage.createNotification({
          title: notificationTitle,
          message: notificationMessage,
          targetRole: "all", // Send to both admin and analyst
          documentId: document.id,
          documentName: document.name,
          creatorRole: "client",
        });
      }

      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  app.delete("/api/documents/:id", requireRole(['admin', 'analyst']), async (req, res) => {
    try {
      const success = await storage.deleteDocument(req.params.id);
      if (!success) {
        res.status(404).json({ error: "Document not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // Settings routes (all users can view)
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", requireRole(['admin']), async (req, res) => {
    try {
      console.log("Received settings data:", JSON.stringify(req.body, null, 2));
      const validatedData = insertSettingsSchema.parse(req.body);
      console.log("Validated settings data:", JSON.stringify(validatedData, null, 2));
      const settings = await storage.updateSettings(validatedData);
      res.json(settings);
    } catch (error) {
      console.error("Settings validation error:", error);
      res.status(400).json({ error: "Invalid settings data" });
    }
  });

  // Generate PDF endpoint for direct download
  app.post("/api/generate-pdf", async (req, res) => {
    try {
      const { documentHtml, documentName } = req.body;

      if (!documentHtml) {
        res.status(400).json({ error: "Missing document HTML" });
        return;
      }

      // Convert HTML to PDF
      const pdfOptions: any = {
        format: "A4",
        printBackground: true,
        margin: {
          top: "20mm",
          bottom: "20mm",
          left: "15mm",
          right: "15mm"
        },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      };

      // Only set executablePath if running on Replit (env var is set in server/index.ts)
      if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        pdfOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      }

      const file = { content: documentHtml };
      const pdfBuffer = await htmlPdf.generatePdf(file, pdfOptions);

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${documentName || 'document'}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error("PDF generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate PDF" });
    }
  });

  app.post("/api/send-email", requireRole(['admin', 'analyst']), async (req, res) => {
    try {
      const { recipient, subject, message, documentHtml, documentName } = req.body;

      if (!recipient || !subject || !documentHtml) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const escapeHtml = (text: string) => {
        return text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      };

      const safeMessage = message ? escapeHtml(message) : "Please find the attached document.";

      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Document Attached</h2>
          <p style="color: #666; line-height: 1.6;">
            ${safeMessage}
          </p>
          <p style="color: #666; line-height: 1.6;">
            The document is attached as a PDF file. You can:
          </p>
          <ul style="color: #666; line-height: 1.6;">
            <li>Open it directly in your PDF viewer</li>
            <li>Print it for your records</li>
            <li>Save it on your device</li>
          </ul>
          <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
            This email was sent from ReqGen Document Management System
          </p>
        </div>
      `;

      // Convert HTML to PDF
      const pdfOptions: any = {
        format: "A4",
        printBackground: true,
        margin: {
          top: "20mm",
          bottom: "20mm",
          left: "15mm",
          right: "15mm"
        },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      };

      // Only set executablePath if running on Replit (env var is set in server/index.ts)
      if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        pdfOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      }

      const file = { content: documentHtml };
      const pdfBuffer = await htmlPdf.generatePdf(file, pdfOptions);

      const filename = documentName ? `${documentName}.pdf` : "document.pdf";

      await sendEmail({
        to: recipient,
        subject,
        text: message || "Please find the attached document.",
        html: emailBody,
        attachments: [
          {
            filename,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });

      res.json({ success: true, message: "Email sent successfully" });
    } catch (error: any) {
      console.error("Email sending error:", error);
      res.status(500).json({ error: error.message || "Failed to send email" });
    }
  });

  // Vakyansh Speech-to-Text Transcription
  const upload = multer({ storage: multer.memoryStorage() });

  app.post("/api/vakyansh-transcribe", upload.single('audio'), async (req, res) => {
    let inputPath: string | null = null;
    let outputPath: string | null = null;

    try {
      if (!req.file) {
        res.status(400).json({ error: "No audio file provided" });
        return;
      }

      const language = req.body.language || 'hi'; // Default to Hindi
      const audioBuffer = req.file.buffer;

      console.log(`Vakyansh transcription request - Language: ${language}, Original audio size: ${audioBuffer.length} bytes, Format: ${req.file.mimetype}`);

      // Create temp files for audio conversion
      const tempDir = tmpdir();
      inputPath = path.join(tempDir, `input-${Date.now()}.webm`);
      outputPath = path.join(tempDir, `output-${Date.now()}.wav`);

      // Write input audio to temp file
      await fs.writeFile(inputPath, audioBuffer);
      console.log(`Saved input audio to: ${inputPath}`);

      // Convert WebM/other formats to WAV using FFmpeg
      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath!)
          .toFormat('wav')
          .audioChannels(1) // Mono
          .audioFrequency(16000) // 16kHz sample rate (recommended for speech)
          .on('end', () => {
            console.log('Audio conversion to WAV completed');
            resolve();
          })
          .on('error', (err) => {
            console.error('FFmpeg conversion error:', err);
            reject(new Error(`Audio conversion failed: ${err.message}`));
          })
          .save(outputPath!);
      });

      // Read converted WAV file
      const wavBuffer = await fs.readFile(outputPath);
      console.log(`Converted WAV size: ${wavBuffer.length} bytes`);

      // Convert WAV buffer to base64
      const base64Audio = wavBuffer.toString('base64');

      // Vakyansh API endpoint
      const vakyanshUrl = `https://cdac.ulcacontrib.org/asr/v1/recognize/${language}`;

      // Prepare Vakyansh API request
      const vakyanshPayload = {
        config: {
          language: {
            sourceLanguage: language
          },
          transcriptionFormat: {
            value: "transcript"
          },
          audioFormat: "wav"
        },
        audio: [
          {
            audioContent: base64Audio
          }
        ]
      };

      console.log(`Calling Vakyansh API: ${vakyanshUrl}`);

      // Call Vakyansh API with timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(vakyanshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vakyanshPayload),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Vakyansh API error:', response.status, errorText);
        res.status(500).json({
          error: "Transcription service error",
          details: `Vakyansh API returned ${response.status}. Please try again.`
        });
        return;
      }

      const result = await response.json();
      console.log('Vakyansh API response:', JSON.stringify(result, null, 2));

      // Extract transcription from response
      const transcription = result.output?.[0]?.source || result.output?.[0]?.text || '';

      if (!transcription) {
        console.error('No transcription in response:', result);
        res.status(500).json({
          error: "No transcription received",
          details: "The audio could not be transcribed. Please speak clearly and try again."
        });
        return;
      }

      console.log(`Transcription successful - Language: ${language}, Text: "${transcription}"`);

      res.json({
        success: true,
        transcription,
        language: result.config?.language?.sourceLanguage || language
      });

    } catch (error: any) {
      console.error("Vakyansh transcription error:", error);

      let errorMessage = "Transcription failed";
      let errorDetails = error.message;

      if (error.name === 'AbortError') {
        errorMessage = "Transcription timeout";
        errorDetails = "The transcription service took too long to respond. Please try again with shorter audio.";
      }

      res.status(500).json({
        error: errorMessage,
        details: errorDetails
      });
    } finally {
      // Clean up temp files
      try {
        if (inputPath) await fs.unlink(inputPath);
        if (outputPath) await fs.unlink(outputPath);
        console.log('Temp files cleaned up');
      } catch (cleanupError) {
        console.error('Error cleaning up temp files:', cleanupError);
      }
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      const userRole = req.headers['x-user-role'] as string;

      if (!userId || !userRole) {
        res.status(401).json({ error: "Unauthorized - No user information provided" });
        return;
      }

      const notifications = await storage.getNotificationsForUser(userId, userRole);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized - No user ID provided" });
        return;
      }

      const success = await storage.markNotificationRead(req.params.id, userId);
      if (!success) {
        res.status(404).json({ error: "Notification not found" });
        return;
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  app.patch("/api/notifications/read-all", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({ error: "Unauthorized - No user ID provided" });
        return;
      }

      await storage.markAllNotificationsRead(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
  });

  // ============================================================
  // HUGGING FACE SPACES / GRADIO API INTEGRATION
  // ============================================================
  // Set PYTHON_BACKEND_URL to your HF Spaces URL:
  // Example: https://YOUR-USERNAME-reqgen-ai.hf.space
  // ============================================================

  const rawPythonUrl = process.env.PYTHON_BACKEND_URL || "http://127.0.0.1:5001";
  const pythonUrl = rawPythonUrl.endsWith('/') ? rawPythonUrl.slice(0, -1) : rawPythonUrl;

  // Check if using Hugging Face Spaces (uses Gradio API format)
  const isHuggingFace = rawPythonUrl.includes('.hf.space') || rawPythonUrl.includes('huggingface');

  console.log(`[AI Backend] URL: ${pythonUrl}`);
  console.log(`[AI Backend] Using Hugging Face Spaces: ${isHuggingFace}`);

  // ============================================================
  // GRADIO API HELPER FUNCTIONS (for Hugging Face Spaces)
  // ============================================================

  /**
   * Call a Gradio API endpoint on Hugging Face Spaces
   * Gradio uses a specific API format: POST /call/{fn_index} then GET /call/{fn_index}/{event_id}
   */
  const callGradioApi = async (fnIndex: number, inputs: any[]): Promise<any> => {
    try {
      console.log(`[Gradio] Calling function index ${fnIndex} at ${pythonUrl}`);

      // Step 1: Submit the request
      const submitResponse = await fetch(`${pythonUrl}/call/${fnIndex}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: inputs })
      });

      if (!submitResponse.ok) {
        const errorText = await submitResponse.text();
        console.error(`[Gradio] Submit failed: ${submitResponse.status} ${errorText}`);
        throw new Error(`Gradio API error: ${submitResponse.status}`);
      }

      const submitData = await submitResponse.json();
      const eventId = submitData.event_id;
      console.log(`[Gradio] Event ID: ${eventId}`);

      // Step 2: Get the result (SSE stream, but we just need the final data)
      const resultResponse = await fetch(`${pythonUrl}/call/${fnIndex}/${eventId}`);

      if (!resultResponse.ok) {
        throw new Error(`Gradio result fetch failed: ${resultResponse.status}`);
      }

      // Parse SSE response - the data comes as "data: {...}\n\n"
      const resultText = await resultResponse.text();
      console.log(`[Gradio] Raw result: ${resultText.substring(0, 500)}`);

      // Find the last "data:" line which contains the final result
      const dataLines = resultText.split('\n').filter(line => line.startsWith('data:'));
      if (dataLines.length === 0) {
        throw new Error('No data received from Gradio');
      }

      const lastDataLine = dataLines[dataLines.length - 1];
      const jsonStr = lastDataLine.substring(5).trim(); // Remove "data:" prefix
      const result = JSON.parse(jsonStr);

      console.log(`[Gradio] Parsed result:`, result);
      return result;
    } catch (error: any) {
      console.error(`[Gradio] API error:`, error);
      throw error;
    }
  };

  /**
   * Upload file to Gradio and get file URL
   */
  const uploadToGradio = async (fileBuffer: Buffer, filename: string, mimetype: string): Promise<string> => {
    console.log(`[Gradio] Uploading file: ${filename} (${fileBuffer.length} bytes)`);

    const formData = new FormData();
    const blob = new Blob([new Uint8Array(fileBuffer)], { type: mimetype });
    formData.append('files', blob, filename);

    const uploadResponse = await fetch(`${pythonUrl}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!uploadResponse.ok) {
      throw new Error(`File upload failed: ${uploadResponse.status}`);
    }

    const uploadResult = await uploadResponse.json();
    console.log(`[Gradio] Upload result:`, uploadResult);

    // Gradio returns an array of file paths
    if (Array.isArray(uploadResult) && uploadResult.length > 0) {
      return uploadResult[0]; // Return the file path/URL
    }

    throw new Error('No file path returned from upload');
  };

  // ============================================================
  // STANDARD PYTHON BACKEND PROXY HELPERS
  // ============================================================

  const proxyJson = async (req: Request, res: Response, endpoint: string) => {
    try {
      console.log(`[Proxy] ${req.method} ${endpoint} -> ${pythonUrl}`);
      const response = await fetch(`${pythonUrl}${endpoint}`, {
        method: req.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Proxy] Error: ${response.status} ${errorText}`);
        res.status(response.status).send(errorText);
        return;
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error(`[Proxy] Error:`, error);
      res.status(500).json({ error: "Backend communication failed", details: error.message });
    }
  };

  const proxyFile = async (req: Request, res: Response, endpoint: string) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }

      console.log(`[Proxy] File upload ${endpoint}: ${req.file.originalname} (${req.file.size} bytes)`);

      const formData = new FormData();
      const fileBlob = new Blob([new Uint8Array(req.file.buffer)], { type: req.file.mimetype });
      formData.append('audio', fileBlob, req.file.originalname);

      Object.keys(req.body).forEach(key => {
        formData.append(key, req.body[key]);
      });

      const response = await fetch(`${pythonUrl}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text();
      console.log(`[Proxy] Response: ${response.status}`);

      if (!response.ok) {
        res.status(response.status).json({
          error: "Backend error",
          status: response.status,
          details: responseText.substring(0, 1000)
        });
        return;
      }

      try {
        const data = JSON.parse(responseText);
        res.json(data);
      } catch {
        res.status(500).json({
          error: "Invalid JSON from backend",
          rawResponse: responseText.substring(0, 500)
        });
      }
    } catch (error: any) {
      console.error(`[Proxy] File error:`, error);
      res.status(500).json({ error: "Backend communication failed", details: error.message });
    }
  };

  // ============================================================
  // API ROUTES - Smart routing between HF Spaces and local backend
  // ============================================================

  /**
   * Process Audio - Transcription + Summarization
   * HF Spaces Gradio function index: 2 (third tab in Gradio interface)
   */
  app.post("/api/python/process-audio", upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No audio file provided" });
        return;
      }

      if (isHuggingFace) {
        console.log(`[HF Spaces] Processing audio: ${req.file.originalname}`);

        // Upload file to Gradio first
        const filePath = await uploadToGradio(req.file.buffer, req.file.originalname, req.file.mimetype);

        // Call process_audio function (fn_index 2 based on tab order)
        // Inputs: audio_file, strategy, quality
        const strategy = req.body.strategy || "balanced";
        const quality = req.body.quality || "medium";

        const result = await callGradioApi(2, [filePath, strategy, quality]);

        // Parse the JSON result from Gradio
        if (result && Array.isArray(result) && result.length > 0) {
          const jsonResponse = JSON.parse(result[0]);

          if (jsonResponse.error) {
            res.status(500).json({ error: jsonResponse.error });
            return;
          }

          res.json({
            success: true,
            transcript: jsonResponse.transcript,
            summary: jsonResponse.summary,
            language: jsonResponse.language,
            language_name: jsonResponse.language_name || jsonResponse.language,
            word_count: jsonResponse.word_count
          });
        } else {
          throw new Error("Invalid response from Gradio");
        }
      } else {
        // Standard Python backend proxy
        proxyFile(req, res, "/api/process-audio");
      }
    } catch (error: any) {
      console.error(`[Process Audio] Error:`, error);
      res.status(500).json({
        error: "Audio processing failed",
        details: error.message,
        hint: isHuggingFace ? "Check if HF Spaces is running" : "Check if Python backend is running"
      });
    }
  });

  /**
   * Transcribe Audio Only
   * HF Spaces Gradio function index: 0 (transcribe_audio - first tab)
   */
  app.post("/api/python/transcribe", upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No audio file provided" });
        return;
      }

      if (isHuggingFace) {
        console.log(`[HF Spaces] Transcribing: ${req.file.originalname}`);

        const filePath = await uploadToGradio(req.file.buffer, req.file.originalname, req.file.mimetype);

        // Call transcribe_audio function (fn_index 0)
        const result = await callGradioApi(0, [filePath]);

        if (result && Array.isArray(result) && result.length > 0) {
          const jsonResponse = JSON.parse(result[0]);

          if (jsonResponse.error) {
            res.status(500).json({ error: jsonResponse.error });
            return;
          }

          res.json({
            success: true,
            transcript: jsonResponse.transcript,
            language: jsonResponse.language,
            word_count: jsonResponse.word_count
          });
        } else {
          throw new Error("Invalid response from Gradio");
        }
      } else {
        proxyFile(req, res, "/api/transcribe");
      }
    } catch (error: any) {
      console.error(`[Transcribe] Error:`, error);
      res.status(500).json({ error: "Transcription failed", details: error.message });
    }
  });

  /**
   * Summarize/Refine Text
   * HF Spaces Gradio function index: 1 (summarize_text - second tab)
   */
  app.post("/api/python/summarize", async (req, res) => {
    try {
      const { text, strategy = "balanced", quality = "medium" } = req.body;

      if (!text || text.trim().length < 10) {
        res.status(400).json({ error: "Text too short to summarize" });
        return;
      }

      if (isHuggingFace) {
        console.log(`[HF Spaces] Summarizing text (${text.length} chars)`);

        // Call summarize_text function (fn_index 1)
        const result = await callGradioApi(1, [text, strategy, quality]);

        if (result && Array.isArray(result) && result.length > 0) {
          const jsonResponse = JSON.parse(result[0]);

          if (jsonResponse.error) {
            res.status(500).json({ error: jsonResponse.error });
            return;
          }

          res.json({
            success: true,
            summary: jsonResponse.summary,
            word_count: jsonResponse.word_count,
            summary_word_count: jsonResponse.summary_word_count
          });
        } else {
          throw new Error("Invalid response from Gradio");
        }
      } else {
        proxyJson(req, res, "/api/summarize");
      }
    } catch (error: any) {
      console.error(`[Summarize] Error:`, error);
      res.status(500).json({ error: "Summarization failed", details: error.message });
    }
  });

  /**
   * Generate Document (BRD/PO)
   * HF Spaces Gradio function index: 3 (fourth tab in Gradio interface)
   */
  app.post("/api/python/generate-document", async (req, res) => {
    try {
      const { text, document_type = "brd", metadata = {} } = req.body;

      if (!text) {
        res.status(400).json({ error: "No text provided" });
        return;
      }

      if (isHuggingFace) {
        console.log(`[HF Spaces] Generating ${document_type} document`);

        // Call generate_document function (fn_index 3)
        // Inputs: text, document_type, metadata_json
        const metadataJson = JSON.stringify(metadata);
        const result = await callGradioApi(3, [text, document_type, metadataJson]);

        if (result && Array.isArray(result) && result.length > 0) {
          const jsonResponse = JSON.parse(result[0]);

          if (jsonResponse.error) {
            res.status(500).json({ error: jsonResponse.error });
            return;
          }

          res.json({
            success: true,
            document: jsonResponse.document,
            document_type: jsonResponse.document_type,
            filename: jsonResponse.filename,
            word_count: jsonResponse.word_count
          });
        } else {
          throw new Error("Invalid response from Gradio");
        }
      } else {
        proxyJson(req, res, "/api/generate-document");
      }
    } catch (error: any) {
      console.error(`[Generate Document] Error:`, error);
      res.status(500).json({ error: "Document generation failed", details: error.message });
    }
  });

  /**
   * Test endpoint for file upload
   */
  app.post("/api/python/test-upload", upload.single('audio'), (req, res) => {
    if (isHuggingFace) {
      res.json({
        success: true,
        message: "Using HF Spaces - use /api/python/transcribe or /api/python/process-audio"
      });
    } else {
      proxyFile(req, res, "/api/test-upload");
    }
  });

  /**
   * Debug/Health check endpoint
   */
  app.get("/api/debug-proxy", async (req, res) => {
    try {
      console.log("[Debug] Checking backend connection...");

      if (isHuggingFace) {
        // For HF Spaces, try to fetch the main page
        const response = await fetch(`${pythonUrl}/`);
        res.json({
          configuredUrl: pythonUrl,
          rawEnvVar: process.env.PYTHON_BACKEND_URL,
          isHuggingFace: true,
          status: response.status,
          statusText: response.statusText,
          message: response.ok ? "HF Spaces is accessible" : "HF Spaces may be starting up"
        });
      } else {
        // Standard backend health check
        const healthUrl = `${pythonUrl}/api/health`;
        const response = await fetch(healthUrl);
        const bodyText = await response.text();
        let bodyJson = { error: "Invalid JSON response" };
        try {
          bodyJson = JSON.parse(bodyText);
        } catch (e) {
          // Ignore
        }

        res.json({
          configuredUrl: pythonUrl,
          rawEnvVar: process.env.PYTHON_BACKEND_URL,
          isHuggingFace: false,
          targetEndpoint: healthUrl,
          status: response.status,
          statusText: response.statusText,
          backendResponse: bodyJson
        });
      }
    } catch (error: any) {
      console.error("[Debug] Error:", error);
      res.status(500).json({
        configuredUrl: pythonUrl,
        rawEnvVar: process.env.PYTHON_BACKEND_URL,
        isHuggingFace,
        error: error.message,
        details: "Failed to connect to backend"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
