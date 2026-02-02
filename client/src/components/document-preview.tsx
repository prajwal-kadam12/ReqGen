import type { Settings } from "@shared/schema";

interface DocumentPreviewProps {
  docType: string;
  content: string;
  companyName?: string | null;
  projectName?: string | null;
  generatedAt: Date | string;
  settings?: Settings;
}

export function DocumentPreview({
  docType,
  content,
  companyName,
  projectName,
  generatedAt,
  settings,
}: DocumentPreviewProps) {
  const formattedDate = generatedAt instanceof Date 
    ? generatedAt.toLocaleDateString() 
    : new Date(generatedAt).toLocaleDateString();

  const getDocumentTitle = (type: string) => {
    switch (type) {
      case "brd":
        return "Business Requirement Document";
      case "srs":
        return "Software Requirement Specification";
      case "sdd":
        return "System Design Document";
      case "po":
        return "Purchase Order";
      default:
        return "Document";
    }
  };

  const documentTitle = getDocumentTitle(docType);

  return (
    <div className="border rounded-lg p-8 bg-white space-y-6 text-gray-900">
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-start justify-between mb-4">
          {settings?.logo && (
            <div className="flex-shrink-0">
              <img 
                src={settings.logo} 
                alt="Company Logo" 
                className="h-16 w-auto object-contain"
              />
            </div>
          )}
          <div className="text-right space-y-0.5">
            {settings?.companyName && (
              <p className="text-sm font-bold">{settings.companyName}</p>
            )}
            {settings?.address && (
              <p className="text-xs text-gray-600">{settings.address}</p>
            )}
            {settings?.phone && (
              <p className="text-xs text-gray-600">Phone: {settings.phone}</p>
            )}
            {settings?.email && (
              <p className="text-xs text-gray-600">Email: {settings.email}</p>
            )}
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">
            {documentTitle}
          </h2>
          {companyName && (
            <p className="text-sm font-semibold">Company: {companyName}</p>
          )}
          {projectName && (
            <p className="text-sm font-semibold">Document: {projectName}</p>
          )}
          <p className="text-sm text-gray-500">Generated: {formattedDate}</p>
        </div>
      </div>
      
      <div>
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
          {content}
        </pre>
      </div>
      
      <div className="border-t border-gray-200 pt-6 mt-8">
        <div className="text-center space-y-1">
          {settings?.companyName && (
            <p className="text-xs font-semibold">{settings.companyName}</p>
          )}
          {settings?.address && (
            <p className="text-xs text-gray-600">{settings.address}</p>
          )}
          <div className="flex justify-center gap-4 text-xs text-gray-600">
            {settings?.phone && <span>Phone: {settings.phone}</span>}
            {settings?.email && <span>Email: {settings.email}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
