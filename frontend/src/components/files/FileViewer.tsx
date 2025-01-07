"use client";
import { courseContext } from "@/contexts/courseContext";
import { userContext } from "@/contexts/userContext";
import { useToast } from "@/hooks/use-toast";
import { DocumentInterface } from "@/lib/types/documents";
import { getApiUrl } from "@/utils/helpers";
import { FileText, Frown } from "lucide-react";
import { useState, useEffect, useContext } from "react";
import { Document, Page } from "react-pdf";

import { pdfjs } from "react-pdf";
import { IsLoadingView } from "../general/IsLoadingView";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface DocumentViewerInterface {
  signedUrl: string;
  fileType: string;
}

export default function FileViewer({
  document,
}: {
  document: DocumentInterface | undefined;
}) {
  const { token } = useContext(userContext);
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
            headers: {
              Authorization: `Bearer ${token}`,
            },
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
          fileType: document.document_type || "unknown",
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
  }, [course.info.id, document, toast, token]);

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

  if (isLoading) {
    return <IsLoadingView />;
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
    // const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(doc.signedUrl)}&embedded=true`;
    // return (
    //   <div className="w-full h-full overflow-hidden rounded-md">
    //     <iframe
    //       src={googleViewerUrl}
    //       className="w-full h-full border-0"
    //       title="PDF viewer"
    //     />
    //   </div>
    // );
    return (
      <>
        <PDFViewer url={doc.signedUrl} />
      </>
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
        NOT IMPLEMENTED
        {/* <img
          src={doc.signedUrl}
          alt={document.title}
          className="max-w-full max-h-full object-contain"
        /> */}
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

function PDFViewer({ url }: { url: string }) {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAndCachePDF = async () => {
      try {
        // Check sessionStorage for cached blob URL
        const cachedUrl = sessionStorage.getItem(`pdf_${url}`);
        if (cachedUrl) {
          const blob = await (await fetch(cachedUrl)).blob();
          setPdfBlob(blob);
          return;
        }

        // Fetch and cache if not found
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        sessionStorage.setItem(`pdf_${url}`, blobUrl);
        setPdfBlob(blob);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load PDF"));
      }
    };

    fetchAndCachePDF();

    // Cleanup
    return () => {
      const cachedUrl = sessionStorage.getItem(`pdf_${url}`);
      if (cachedUrl) {
        URL.revokeObjectURL(cachedUrl);
        sessionStorage.removeItem(`pdf_${url}`);
      }
    };
  }, [url]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>{error.message}</p>
      </div>
    );
  }

  if (!pdfBlob) return <IsLoadingView />;

  return (
    <Document
      file={pdfBlob}
      loading={<IsLoadingView />}
      onError={setError}
      className="flex flex-1 w-full overflow-x-scroll"
      error={<IsLoadingView />}
      onLoadSuccess={onDocumentLoadSuccess}
    >
      {Array.from(new Array(numPages), (el, index) => (
        <Page
          onError={setError}
          loading={<IsLoadingView />}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          key={`page_${index + 1}`}
          pageNumber={index + 1}
        />
      ))}
    </Document>
  );
}
