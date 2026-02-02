import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Plus, FileText, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Document } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  // Sort documents by creation date (oldest to newest) - same as Generated Files page
  const sortedDocuments = [...documents].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  const getTypeDisplay = (type: string) => {
    return type.toUpperCase();
  };

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-primary/5 via-background to-accent/5 min-h-full">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your business requirement documents and purchase orders
        </p>
      </div>

      <Card className="hover-elevate shadow-lg border-2 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
            Create New Document
          </CardTitle>
          <CardDescription>
            Start by creating notes in the editor, then refine with AI and generate your document
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setLocation("/editor")} 
            className="gap-2 shadow-lg bg-gradient-to-r from-primary to-accent hover:shadow-xl transition-all"
            data-testid="button-create-document"
          >
            <Plus className="w-4 h-4" />
            New Document
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-2">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardTitle className="text-2xl">My Documents</CardTitle>
          <CardDescription>
            View and manage all your generated documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading documents...
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No documents yet. Create your first document to get started!
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDocuments.slice(0, 5).map((doc) => (
                    <TableRow key={doc.id} className="hover-elevate" data-testid={`row-document-${doc.id}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          {doc.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getTypeDisplay(doc.type)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {formatDate(doc.createdAt)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {sortedDocuments.length > 5 && (
                <div className="mt-4 flex justify-center">
                  <Button 
                    variant="outline"
                    onClick={() => setLocation("/files")}
                    className="gap-2"
                    data-testid="button-view-all-documents"
                  >
                    View All Documents
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
