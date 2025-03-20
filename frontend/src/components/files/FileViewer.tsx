"use client";
import { userContext } from "@/providers/userContext";
import { useToast } from "@/hooks/use-toast";
import { DocumentInterface } from "@/lib/types/documents";
import { getApiUrl } from "@/utils/helpers";
import { FileText, Frown } from "lucide-react";
import { useState, useEffect, useContext } from "react";
// import { Document, Page, pdfjs } from "react-pdf";
// import "react-pdf/dist/esm/Page/AnnotationLayer.css";
// import "react-pdf/dist/esm/Page/TextLayer.css";
import { IsLoadingView } from "../general/IsLoadingView";
import { useCourseStore } from "@/providers/courseStoreProvider";

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.mjs",
//   import.meta.url,
// ).toString();

// if (typeof window !== "undefined" && !pdfjs.GlobalWorkerOptions.workerSrc) {
//   pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
// }

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
  const course = useCourseStore((state) => state.course);

  useEffect(() => {
    async function fetchDocumentContent() {
      setDoc(null);
      if (document === undefined) return;
      setIsLoading(true);
      try {
        const response = await fetch(
          `${getApiUrl()}/courses/${course.id}/documents/${document.id}/signed_url`,
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
  }, [course.id, document, toast, token]);

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
    // const { isIOS, isAndroid } = isMobileOS();

    // // Use native handling for mobile OS
    // if (isIOS || isAndroid) {
    //   return (
    //     <div className="w-full h-full flex items-center justify-center">
    //       <a
    //         href={doc.signedUrl}
    //         className="px-4 py-2 bg-primary-500 text-white rounded-md"
    //       >
    //         Open PDF
    //       </a>
    //     </div>
    //   );
    // }

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

    // Use PDFViewer for desktop
    // FIXME: This is not working
    // return (
    //   <>
    //     <PDFViewer url={doc.signedUrl} />
    //   </>
    // );
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
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
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

// function PDFViewer({ url }: { url: string }) {
//   const [numPages, setNumPages] = useState<number | null>(null);
//   const [error, setError] = useState<Error | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [pdfFile, setPdfFile] = useState<File | null>(null);

//   useEffect(() => {
//     async function fetchPDF() {
//       try {
//         const response = await fetch(url);
//         if (!response.ok) throw new Error("Failed to fetch PDF");
//         const blob = await response.blob();
//         // Convert blob to File object
//         const file = new File([blob], "document.pdf", {
//           type: "application/pdf",
//         });
//         setPdfFile(file);
//         setIsLoading(false);
//       } catch (err) {
//         console.error("Error fetching PDF:", err);
//         setError(err instanceof Error ? err : new Error("Failed to load PDF"));
//       }
//     }
//     fetchPDF();
//   }, [url]);

//   function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
//     setIsLoading(false);
//     setNumPages(numPages);
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-full">
//         <p>{error.message}</p>
//       </div>
//     );
//   }

//   if (isLoading) {
//     return <IsLoadingView />;
//   }

//   if (!pdfFile) {
//     return <IsLoadingView />;
//   }

//   return (
//     <div className="flex-1 flex-shrink-0 border overflow-auto relative">
//       <Document
//         file={pdfFile}
//         loading={<IsLoadingView />}
//         onError={(error) => {
//           console.error("PDF loading error:", error);
//           setError(new Error("Failed to load PDF"));
//         }}
//         className="absolute inset-0"
//         error={
//           <div className="flex items-center justify-center h-full">
//             <p>Failed to load PDF</p>
//           </div>
//         }
//         onLoadSuccess={onDocumentLoadSuccess}
//       >
//         {!isLoading &&
//           numPages &&
//           Array.from(new Array(numPages), (el, index) => (
//             <Page
//               key={`page_${index + 1}`}
//               pageNumber={index + 1}
//               loading={<IsLoadingView />}
//               // renderTextLayer={true}
//               renderAnnotationLayer={false}
//               className="mx-auto mb-4"
//               onLoadError={(error) => {
//                 console.error("Page loading error:", error);
//                 setError(new Error("Failed to load page"));
//               }}
//               error={
//                 <div className="flex items-center justify-center h-full">
//                   <p>Failed to load page</p>
//                 </div>
//               }
//             />
//           ))}
//       </Document>
//     </div>
//   );
// }

// const isMobileOS = () => {
//   const userAgent = navigator.userAgent.toLowerCase();
//   return {
//     isIOS: /iphone|ipad|ipod/.test(userAgent),
//     isAndroid: /android/.test(userAgent),
//   };
// };
