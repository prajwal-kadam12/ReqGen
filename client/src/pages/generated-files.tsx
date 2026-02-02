import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, Download, Mail, FileText, Eye, Trash2, Pencil, ChevronDown, Plus, CheckCircle, AlertCircle, Clock, Undo2, MessageSquare, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/contexts/NotificationContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DocumentPreview } from "@/components/document-preview";
import type { Document, Settings } from "@shared/schema";
import { asBlob } from "html-docx-js-typescript";
import { useUser } from "@/contexts/UserContext";
import { getPermissions } from "@/lib/permissions";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function GeneratedFiles() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { user } = useUser();
  const permissions = getPermissions(user?.role as any);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<Document | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approved" | "needs_changes" | "pending">("approved");
  const [editData, setEditData] = useState({
    name: "",
    companyName: "",
    projectName: "",
    content: "",
  });
  const [emailData, setEmailData] = useState({
    recipient: "",
    subject: "",
    message: "",
  });
  const [approvalMessage, setApprovalMessage] = useState("");
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string>("");

  const { data: files = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: "Document deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete document.",
        variant: "destructive",
      });
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PATCH", `/api/documents/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: "Document updated successfully!",
      });
      setShowEditDialog(false);
      setSelectedFile(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update document.",
        variant: "destructive",
      });
    },
  });

  const approvalMutation = useMutation({
    mutationFn: async (data: { id: string; status: string; clientMessage?: string }) => {
      const response = await apiRequest("PATCH", `/api/documents/${data.id}`, {
        status: data.status,
        clientMessage: data.clientMessage || null,
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      const statusText = variables.status === "approved" ? "approved" : "marked as needing changes";
      toast({
        title: "Success",
        description: `Document ${statusText} successfully!`,
      });
      addNotification("Document Status Updated", `Document has been ${statusText}`);
      setShowApprovalDialog(false);
      setApprovalMessage("");
      setSelectedFile(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update document status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApprovalSubmit = () => {
    if (!selectedFile) return;
    
    if (approvalAction === "needs_changes" && !approvalMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please provide a message explaining what changes are needed.",
        variant: "destructive",
      });
      return;
    }

    approvalMutation.mutate({
      id: selectedFile.id,
      status: approvalAction,
      clientMessage: approvalAction === "needs_changes" ? approvalMessage : undefined,
    });
  };

  const filteredFiles = files
    .filter(
      (file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const handlePreview = (file: Document) => {
    setSelectedFile(file);
  };

  const generateClientSidePDF = async (file: Document, documentTitle: string, htmlContent: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '794px';
    document.body.appendChild(tempDiv);

    try {
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${file.name}.pdf`);
      
      toast({
        title: "Download Successful",
        description: `${file.name}.pdf downloaded successfully (client-side generation).`,
      });
    } finally {
      document.body.removeChild(tempDiv);
    }
  };

  const handleDownload = async (file: Document, format: "pdf" | "docx") => {
    const getDocumentTitle = (type: string) => {
      switch (type.toLowerCase()) {
        case 'brd':
          return 'Business Requirement Document';
        case 'srs':
          return 'Software Requirement Specification';
        case 'sdd':
          return 'System Design Document';
        case 'po':
          return 'Purchase Order';
        default:
          return 'Document';
      }
    };

    const documentTitle = getDocumentTitle(file.type);
    
    // Create simplified HTML for DOCX (Word-friendly)
    const docxHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${file.name}</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 40px; line-height: 1.6;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom: 2px solid #ccc; margin-bottom: 30px; padding-bottom: 15px;">
    <tr>
      <td width="50%" valign="top">
        ${settings?.logo ? `<img src="${settings.logo}" alt="Logo" style="max-width: 150px; height: auto;" />` : ''}
      </td>
      <td width="50%" valign="top" align="right">
        ${settings?.companyName ? `<div style="font-weight: bold; font-size: 14px; margin-bottom: 5px;">${settings.companyName}</div>` : ''}
        ${settings?.address ? `<div style="font-size: 11px; color: #666; margin: 2px 0;">${settings.address}</div>` : ''}
        ${settings?.phone ? `<div style="font-size: 11px; color: #666; margin: 2px 0;">Phone: ${settings.phone}</div>` : ''}
        ${settings?.email ? `<div style="font-size: 11px; color: #666; margin: 2px 0;">Email: ${settings.email}</div>` : ''}
      </td>
    </tr>
  </table>

  <div style="text-align: center; margin: 30px 0;">
    <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 15px; color: #333;">${documentTitle}</h1>
    ${file.companyName ? `<div style="font-size: 14px; font-weight: 600; margin: 8px 0;">Company: ${file.companyName}</div>` : ''}
    ${file.projectName ? `<div style="font-size: 14px; font-weight: 600; margin: 8px 0;">Document: ${file.projectName}</div>` : ''}
    <div style="font-size: 13px; color: #666; margin-top: 8px;">Generated: ${new Date(file.createdAt).toLocaleDateString()}</div>
  </div>

  <div style="white-space: pre-wrap; word-wrap: break-word; font-size: 13px; line-height: 1.6; margin: 30px 0;">
${file.content}
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 2px solid #ccc; margin-top: 40px; padding-top: 15px;">
    <tr>
      <td align="center">
        ${settings?.companyName ? `<div style="font-weight: 600; font-size: 12px; margin-bottom: 5px;">${settings.companyName}</div>` : ''}
        ${settings?.address ? `<div style="font-size: 11px; color: #666;">${settings.address}</div>` : ''}
        ${settings?.phone || settings?.email ? `
          <div style="font-size: 11px; color: #666; margin-top: 5px;">
            ${settings?.phone ? `Phone: ${settings.phone}` : ''} ${settings?.phone && settings?.email ? ' | ' : ''} ${settings?.email ? `Email: ${settings.email}` : ''}
          </div>
        ` : ''}
      </td>
    </tr>
  </table>

</body>
</html>
    `;
    
    // Create complex HTML for PDF (browser rendering)
    const pdfHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${file.name}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 1in;
      line-height: 1.6;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e5e7eb;
    }
    .logo {
      max-width: 150px;
      height: auto;
    }
    .company-info {
      text-align: right;
      font-size: 0.75rem;
    }
    .company-info .company-name {
      font-weight: bold;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }
    .company-info .info-line {
      color: #4b5563;
      margin: 0.125rem 0;
    }
    .title-section {
      text-align: center;
      margin: 2rem 0;
    }
    .doc-title {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 1rem;
      color: #1f2937;
    }
    .doc-metadata {
      font-size: 0.875rem;
      font-weight: 600;
      margin: 0.5rem 0;
    }
    .generated-date {
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.5rem;
    }
    .content {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: sans-serif;
      font-size: 0.875rem;
      line-height: 1.5;
      margin: 2rem 0;
    }
    .footer {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 0.75rem;
    }
    .footer .company-name {
      font-weight: 600;
      font-size: 0.75rem;
      margin-bottom: 0.25rem;
    }
    .footer .contact-info {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 0.25rem;
    }
    @media print {
      body {
        padding: 0.5in;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    ${settings?.logo ? `<img src="${settings.logo}" alt="Company Logo" class="logo" />` : '<div></div>'}
    <div class="company-info">
      ${settings?.companyName ? `<div class="company-name">${settings.companyName}</div>` : ''}
      ${settings?.address ? `<div class="info-line">${settings.address}</div>` : ''}
      ${settings?.phone ? `<div class="info-line">Phone: ${settings.phone}</div>` : ''}
      ${settings?.email ? `<div class="info-line">Email: ${settings.email}</div>` : ''}
    </div>
  </div>
  
  <div class="title-section">
    <h1 class="doc-title">${documentTitle}</h1>
    ${file.companyName ? `<div class="doc-metadata">Company: ${file.companyName}</div>` : ''}
    ${file.projectName ? `<div class="doc-metadata">Document: ${file.projectName}</div>` : ''}
    <div class="generated-date">Generated: ${new Date(file.createdAt).toLocaleDateString()}</div>
  </div>
  
  <div class="content">${file.content}</div>
  
  <div class="footer">
    ${settings?.companyName ? `<div class="company-name">${settings.companyName}</div>` : ''}
    ${settings?.address ? `<div>${settings.address}</div>` : ''}
    ${settings?.phone || settings?.email ? `
      <div class="contact-info">
        ${settings?.phone ? `<span>Phone: ${settings.phone}</span>` : ''}
        ${settings?.email ? `<span>Email: ${settings.email}</span>` : ''}
      </div>
    ` : ''}
  </div>
</body>
</html>
    `;

    try {
      if (format === "pdf") {
        try {
          // Try server-side PDF generation first (works on Replit with Chromium)
          const response = await fetch("/api/generate-pdf", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              documentHtml: pdfHtml,
              documentName: file.name,
            }),
          });

          if (!response.ok) {
            throw new Error("Server-side PDF generation failed");
          }

          const pdfBlob = await response.blob();
          const url = URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${file.name}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          toast({
            title: "Download Successful",
            description: `${file.name}.pdf downloaded successfully.`,
          });
        } catch (serverError) {
          // Fallback to client-side PDF generation (works on localhost without Chromium)
          console.log("Server-side PDF failed, using client-side generation:", serverError);
          await generateClientSidePDF(file, documentTitle, pdfHtml);
        }
      } else {
        // Generate DOCX using simplified HTML
        const docxBlob = await asBlob(docxHtml);
        const blob = docxBlob instanceof Blob ? docxBlob : new Blob([docxBlob], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${file.name}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "Download Successful",
          description: `${file.name}.docx downloaded successfully. Open it in Microsoft Word or Google Docs.`,
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: `Failed to generate ${format.toUpperCase()} file. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleEmail = (file: Document) => {
    setSelectedFile(file);
    setEmailData({
      recipient: "",
      subject: `Document: ${file.name}`,
      message: "",
    });
    setShowEmailDialog(true);
  };

  const sendEmailMutation = useMutation({
    mutationFn: async (emailPayload: { recipient: string; subject: string; message: string; documentHtml: string; documentName: string }) => {
      const response = await apiRequest("POST", "/api/send-email", emailPayload);
      return response.json();
    },
    onSuccess: () => {
      addNotification("Email Sent", `Document sent successfully to ${emailData.recipient}`);
      toast({
        title: "Email Sent",
        description: `Email sent successfully to ${emailData.recipient}`,
      });
      setShowEmailDialog(false);
      setSelectedFile(null);
      setEmailData({
        recipient: "",
        subject: "",
        message: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send email. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendEmail = async () => {
    if (!selectedFile) return;

    const getDocumentTitle = (type: string) => {
      switch (type.toLowerCase()) {
        case 'brd':
          return 'Business Requirement Document';
        case 'srs':
          return 'Software Requirement Specification';
        case 'sdd':
          return 'System Design Document';
        case 'po':
          return 'Purchase Order';
        default:
          return 'Document';
      }
    };

    const documentTitle = getDocumentTitle(selectedFile.type);
    
    const documentHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${selectedFile.name}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 1in;
      line-height: 1.6;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e5e7eb;
    }
    .logo {
      max-width: 150px;
      height: auto;
    }
    .company-info {
      text-align: right;
      font-size: 0.75rem;
    }
    .company-info .company-name {
      font-weight: bold;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }
    .company-info .info-line {
      color: #4b5563;
      margin: 0.125rem 0;
    }
    .title-section {
      text-align: center;
      margin: 2rem 0;
    }
    .doc-title {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 1rem;
      color: #1f2937;
    }
    .doc-metadata {
      font-size: 0.875rem;
      font-weight: 600;
      margin: 0.5rem 0;
    }
    .generated-date {
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.5rem;
    }
    .content {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: sans-serif;
      font-size: 0.875rem;
      line-height: 1.5;
      margin: 2rem 0;
    }
    .footer {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 0.75rem;
    }
    .footer .company-name {
      font-weight: 600;
      font-size: 0.75rem;
      margin-bottom: 0.25rem;
    }
    .footer .contact-info {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 0.25rem;
    }
  </style>
</head>
<body>
  <div class="header">
    ${settings?.logo ? `<img src="${settings.logo}" alt="Company Logo" class="logo" />` : '<div></div>'}
    <div class="company-info">
      ${settings?.companyName ? `<div class="company-name">${settings.companyName}</div>` : ''}
      ${settings?.address ? `<div class="info-line">${settings.address}</div>` : ''}
      ${settings?.phone ? `<div class="info-line">Phone: ${settings.phone}</div>` : ''}
      ${settings?.email ? `<div class="info-line">Email: ${settings.email}</div>` : ''}
    </div>
  </div>
  
  <div class="title-section">
    <h1 class="doc-title">${documentTitle}</h1>
    ${selectedFile.companyName ? `<div class="doc-metadata">Company: ${selectedFile.companyName}</div>` : ''}
    ${selectedFile.projectName ? `<div class="doc-metadata">Document: ${selectedFile.projectName}</div>` : ''}
    <div class="generated-date">Generated: ${new Date(selectedFile.createdAt).toLocaleDateString()}</div>
  </div>
  
  <div class="content">${selectedFile.content}</div>
  
  <div class="footer">
    ${settings?.companyName ? `<div class="company-name">${settings.companyName}</div>` : ''}
    ${settings?.address ? `<div>${settings.address}</div>` : ''}
    ${settings?.phone || settings?.email ? `
      <div class="contact-info">
        ${settings?.phone ? `<span>Phone: ${settings.phone}</span>` : ''}
        ${settings?.email ? `<span>Email: ${settings.email}</span>` : ''}
      </div>
    ` : ''}
  </div>
</body>
</html>
    `;

    await sendEmailMutation.mutateAsync({
      recipient: emailData.recipient,
      subject: emailData.subject,
      message: emailData.message,
      documentHtml,
      documentName: selectedFile.name,
    });
  };

  const handleEdit = (file: Document) => {
    // Store document data in localStorage for Note Editor to pick up
    localStorage.setItem('editingDocument', JSON.stringify({
      id: file.id,
      name: file.name,
      companyName: file.companyName || "",
      projectName: file.projectName || "",
      content: file.content,
      type: file.type,
    }));
    // Navigate to Note Editor
    setLocation('/editor');
  };

  const handleUpdate = async () => {
    if (!selectedFile) return;
    
    await updateDocumentMutation.mutateAsync({
      id: selectedFile.id,
      data: {
        name: editData.name,
        companyName: editData.companyName || null,
        projectName: editData.projectName || null,
        content: editData.content,
        status: "pending",
      },
    });
  };

  const handleDelete = async (file: Document) => {
    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
      await deleteDocumentMutation.mutateAsync(file.id);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-primary/5 via-background to-accent/5 min-h-full">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Generated Files
        </h1>
        <p className="text-muted-foreground mt-2">
          View, download, and share your generated documents
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents by name or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        {permissions.canCreateDocuments && (
          <Button
            onClick={() => setLocation("/editor")}
            className="bg-gradient-to-r from-primary to-accent gap-2"
            data-testid="button-new-document"
          >
            <Plus className="w-4 h-4" />
            New Document
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading documents...
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery ? "No documents found matching your search." : "No documents yet. Create your first document to get started!"}
        </div>
      ) : (
        <div className="border rounded-lg shadow-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-br from-primary/10 to-accent/10">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="font-semibold">Document Name</TableHead>
                <TableHead className="font-semibold">Company Name</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold text-center">Status</TableHead>
                {(user?.role === "admin" || user?.role === "analyst") && (
                  <TableHead className="font-semibold text-center">Client Message</TableHead>
                )}
                <TableHead className="font-semibold">Created Date</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.map((file, index) => (
                <TableRow key={file.id} className="hover:bg-muted/50" data-testid={`row-file-${file.id}`}>
                  <TableCell>
                    <div className="flex items-center justify-center p-2 bg-gradient-to-br from-primary to-accent rounded-lg w-10 h-10">
                      <span className="text-white font-semibold">{index + 1}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {file.name}
                      {file.previousContent && file.previousContent.trim().length > 0 && (
                        <Badge variant="secondary" className="bg-blue-500 text-white gap-1">
                          <RefreshCw className="w-3 h-3" />
                          Updated
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {file.companyName || <span className="italic text-muted-foreground/50">Not specified</span>}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-gradient-to-r from-primary to-accent">
                      {file.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {user?.role === "client" ? (
                      <>
                        {file.status === "approved" ? (
                          <Badge className="bg-green-500 gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Approved
                          </Badge>
                        ) : file.status === "needs_changes" ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Need Changes
                          </Badge>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-green-600 hover:text-green-600"
                              onClick={() => {
                                setSelectedFile(file);
                                setApprovalAction("approved");
                                setShowApprovalDialog(true);
                              }}
                              data-testid={`button-approve-${file.id}`}
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-orange-600 hover:text-orange-600"
                              onClick={() => {
                                setSelectedFile(file);
                                setApprovalAction("needs_changes");
                                setShowApprovalDialog(true);
                              }}
                              data-testid={`button-needs-changes-${file.id}`}
                            >
                              <AlertCircle className="w-4 h-4" />
                              Need Changes
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {file.status === "approved" ? (
                          <Badge className="bg-green-500 gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Approved
                          </Badge>
                        ) : file.status === "needs_changes" ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Needs Changes
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="w-3 h-3" />
                            Pending
                          </Badge>
                        )}
                      </>
                    )}
                  </TableCell>
                  {(user?.role === "admin" || user?.role === "analyst") && (
                    <TableCell className="text-center">
                      {file.clientMessage ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => {
                            setSelectedMessage(file.clientMessage || "");
                            setShowMessageDialog(true);
                          }}
                          data-testid={`button-view-message-${file.id}`}
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="sr-only">View Message</span>
                        </Button>
                      ) : (
                        <span className="italic text-muted-foreground/50 text-xs">-</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="text-muted-foreground">{formatDate(file.createdAt)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => handlePreview(file)}
                        data-testid={`button-preview-${file.id}`}
                      >
                        <Eye className="w-4 h-4" />
                        <span className="sr-only">Preview</span>
                      </Button>
                      {permissions.canEditDocuments && file.status !== "approved" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleEdit(file)}
                          data-testid={`button-edit-${file.id}`}
                        >
                          <Pencil className="w-4 h-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            data-testid={`button-download-${file.id}`}
                          >
                            <Download className="w-4 h-4" />
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDownload(file, "pdf")}
                            data-testid={`button-download-pdf-${file.id}`}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Download as PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDownload(file, "docx")}
                            data-testid={`button-download-docx-${file.id}`}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Download as DOCX
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {permissions.canEmailDocuments && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleEmail(file)}
                          data-testid={`button-email-${file.id}`}
                        >
                          <Mail className="w-4 h-4" />
                          <span className="sr-only">Email</span>
                        </Button>
                      )}
                      {permissions.canDeleteDocuments && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(file)}
                          data-testid={`button-delete-${file.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!selectedFile && !showEmailDialog} onOpenChange={(open) => !open && setSelectedFile(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {selectedFile?.name}
            </DialogTitle>
            <DialogDescription>
              Generated: {selectedFile && formatDate(selectedFile.createdAt)}
            </DialogDescription>
          </DialogHeader>
          {selectedFile && (
            <DocumentPreview
              docType={selectedFile.type}
              content={selectedFile.content}
              companyName={selectedFile.companyName}
              projectName={selectedFile.projectName}
              generatedAt={selectedFile.createdAt}
              settings={settings}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedFile(null)} data-testid="button-close-preview">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Document via Email</DialogTitle>
            <DialogDescription>
              Send {selectedFile?.name} to a recipient
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Email</Label>
              <Input
                id="recipient"
                type="email"
                placeholder="email@example.com"
                value={emailData.recipient}
                onChange={(e) => setEmailData({ ...emailData, recipient: e.target.value })}
                data-testid="input-recipient-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={emailData.subject}
                readOnly
                className="bg-muted cursor-not-allowed"
                data-testid="input-email-subject"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Optional message..."
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                data-testid="textarea-email-message"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowEmailDialog(false);
                setSelectedFile(null);
              }} 
              disabled={sendEmailMutation.isPending} 
              data-testid="button-cancel-email"
            >
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={!emailData.recipient || sendEmailMutation.isPending} data-testid="button-send-email">
              {sendEmailMutation.isPending ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>
              Update document information and content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Document Name</Label>
              <Input
                id="edit-name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                placeholder="Enter document name"
                data-testid="input-edit-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-company">Company Name</Label>
              <Input
                id="edit-company"
                value={editData.companyName}
                onChange={(e) => setEditData({ ...editData, companyName: e.target.value })}
                placeholder="Enter company name"
                data-testid="input-edit-company"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project">Project Name</Label>
              <Input
                id="edit-project"
                value={editData.projectName}
                onChange={(e) => setEditData({ ...editData, projectName: e.target.value })}
                placeholder="Enter project name"
                data-testid="input-edit-project"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={editData.content}
                onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                placeholder="Enter document content"
                className="min-h-[200px]"
                data-testid="textarea-edit-content"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} data-testid="button-cancel-edit">
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={!editData.name || !editData.content || updateDocumentMutation.isPending}
              data-testid="button-save-edit"
            >
              {updateDocumentMutation.isPending ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === "approved" 
                ? "Approve Document" 
                : approvalAction === "needs_changes"
                ? "Request Changes"
                : "Return to Client"}
            </DialogTitle>
            <DialogDescription>
              {approvalAction === "approved" 
                ? "Confirm that you approve this document." 
                : approvalAction === "needs_changes"
                ? "Please explain what changes are needed for this document."
                : "Confirm that you want to return this document to the client for re-review."}
            </DialogDescription>
          </DialogHeader>
          {approvalAction === "needs_changes" && (
            <div className="space-y-2">
              <Label htmlFor="approval-message">Message</Label>
              <Textarea
                id="approval-message"
                value={approvalMessage}
                onChange={(e) => setApprovalMessage(e.target.value)}
                placeholder="Describe what changes are needed..."
                className="min-h-[120px]"
                data-testid="textarea-approval-message"
              />
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowApprovalDialog(false);
                setApprovalMessage("");
              }} 
              disabled={approvalMutation.isPending} 
              data-testid="button-cancel-approval"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApprovalSubmit} 
              disabled={approvalMutation.isPending}
              data-testid="button-submit-approval"
            >
              {approvalMutation.isPending 
                ? "Submitting..." 
                : approvalAction === "approved" 
                ? "Approve" 
                : approvalAction === "needs_changes"
                ? "Submit Changes"
                : "Return to Client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Client Change Request
            </DialogTitle>
            <DialogDescription>
              Message from client explaining requested changes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm whitespace-pre-wrap">{selectedMessage}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageDialog(false)} data-testid="button-close-message">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
