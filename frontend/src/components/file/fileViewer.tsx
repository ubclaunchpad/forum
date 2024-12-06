import { DocumentInterface } from "@/app/forum/courses/[id]/resources/document";
import { courseContext } from "@/contexts/courseContext";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/utils/helpers";
import { FileText, Frown } from "lucide-react";
import { useState, useEffect, useContext } from "react";

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
  const course = useContext(courseContext);

  useEffect(() => {
    async function fetchDocumentContent() {
      setDoc(null);
      if (document === undefined) return;
      setIsLoading(true);
      try {
        const response = await fetch(
          `${getApiUrl()}/courses/${course.info.id}/documents/${document.id}/signed_url`,
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
  }, [course.info.id, document, toast]);

  // No document selected
  if (document === undefined) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <div className="h-20 w-20 text-muted-foreground">
          <FileText className="h-full w-full" />
        </div>
        <h5>Select a file to view</h5>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading document...</p>
      </div>
    );
  }

  // Error state - no document data
  if (!doc) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>No document data available</p>
      </div>
    );
  }

  // PDF viewer
  if (doc.fileType === "application/pdf") {
    const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(doc.signedUrl)}&embedded=true`;
    return (
      <div className="w-full h-full overflow-hidden rounded-md">
        <iframe
          src={googleViewerUrl}
          className="w-full h-full border-0"
          title="PDF viewer"
        />
      </div>
    );
  }

  // Text viewer
  if (doc.fileType.startsWith("text")) {
    return (
      <div className="w-full h-full bg-white p-4 overflow-auto">
        <object
          data={doc.signedUrl}
          type={doc.fileType}
          className="w-full h-full"
        >
          <iframe
            src={doc.signedUrl}
            className="w-full h-full border-0"
            title="Text viewer"
          />
        </object>
      </div>
    );
  }

  // Image viewer
  if (doc.fileType.startsWith("image")) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/5">
        <img
          src={doc.signedUrl}
          alt={document.title}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  }

  // Alternative for documents that can be previewed with Google Docs Viewer
  if (
    [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
    ].includes(doc.fileType)
  ) {
    const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(doc.signedUrl)}&embedded=true`;
    return (
      <div className="w-full h-full">
        <iframe
          src={googleViewerUrl}
          className="w-full h-full border-0"
          title="Document viewer"
        />
      </div>
    );
  }

  // Unsupported file type
  return (
    <div className="flex flex-col items-center justify-center gap-2 h-full">
      <Frown className="h-8 w-8 text-muted-foreground" />
      <p>Unsupported file type: {doc.fileType}</p>
      <a
        href={doc.signedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline mt-2"
      >
        Download file instead
      </a>
    </div>
  );
}
