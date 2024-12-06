"use client";

import { DocumentInterface } from "@/app/forum/courses/[id]/resources/document";
import { useToast } from "@/hooks/use-toast";
import { FileText, Frown } from "lucide-react";
import { useState, useEffect } from "react";

interface DocumentViewerInterface {
  signedUrl: string;
  fileType: string;
}

export default function FileViewer({
  document,
}: {
  document: DocumentInterface | undefined;
}) {
  const [doc, setDoc] = useState<DocumentViewerInterface | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchDocumentContent() {
      setDoc(null);

      if (document === undefined) return;
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/courses/1ef384fe-040c-4ba9-813e-dfeb282402bf/documents/${document.id}/signed-url?file_path=${document.file_url}`,
          {
            method: "GET",
          },
        );

        if (!response.ok) {
          const errorDetails = await response.json();
          throw new Error(
            `HTTP Error ${response.status}: ${errorDetails.message || "Something went wrong"}`,
          );
        }

        const result = await response.json();

        setDoc({
          signedUrl: result.signed_url,
          fileType: document.document_type,
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast({
            title: "Error",
            description: `Failed to display document: ${error.message}`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "An unknown error occurred",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchDocumentContent();
  }, [document]);

  // No document selected
  if (document === undefined) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 h-20 w-20 text-muted-foreground">
          <FileText className="h-full w-full" />
        </div>
        <h3 className="text-lg font-medium">Select a file to view</h3>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="text-center">
        <p>Loading document...</p>
      </div>
    );
  }

  if (doc?.fileType === "application/pdf" || doc?.fileType.startsWith("text"))
    return <iframe src={doc.signedUrl} className="w-full h-full"></iframe>;
  if (doc?.fileType.startsWith("image"))
    return <img src={doc.signedUrl} className="h-3/4"></img>;

  return (
    <div>
      Unsupported file type <Frown />
    </div>
  );
}
