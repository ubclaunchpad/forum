"use client";
import { userContext } from "@/providers/userContext";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/utils/helpers";
import { FileText, Frown, Loader2 } from "lucide-react";
import { useState, useEffect, useContext } from "react";
// import { pdfjs } from "react-pdf";
// import "react-pdf/dist/esm/Page/AnnotationLayer.css";
// import "react-pdf/dist/esm/Page/TextLayer.css";
import { useCourseStore } from "@/providers/courseStoreProvider";
import { GetDocument } from "@forum/shared";
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentViewerInterface {
  signedUrl: string;
  fileType: string;
}

export default function FileViewer({
  document,
}: {
  document: GetDocument | undefined;
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
          `${getApiUrl()}/documents/document/${document.id}/signed_url`,
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
        let signedUrl = result.signed_url;
        const apiUrl = getApiUrl();

        // Extract base from apiUrl (protocol + domain)
        const baseUrlRegex = /^(https?:\/\/[^\/]+)/;
        const apiUrlMatch = apiUrl.match(baseUrlRegex);
        const apiBase = apiUrlMatch ? apiUrlMatch[1] : apiUrl;

        // Extract path from signedUrl (everything after the domain)
        const pathRegex = /^https?:\/\/[^\/]+(\/.*)/;
        const signedUrlMatch = signedUrl.match(pathRegex);

        if (signedUrlMatch && signedUrlMatch[1]) {
          // Combine the API base with the signed URL path
          const path = signedUrlMatch[1];
          signedUrl = `${apiBase}${path}`;
        }

        setDoc({
          signedUrl: signedUrl, // Use the combined URL
          fileType: result.file_type || "unknown",
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
    return (
      <div className="flex w-full flex-1  border-neutral-200 justify-center items-center">
        <Loader2 className="h-4 w-4 animate-spin" />
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
    return <NativePDFViewer url={doc.signedUrl} />;
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
          alt={document.description || "Document image"}
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

function NativePDFViewer({ url }: { url: string }) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPDF() {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch PDF");
        const blob = await response.blob();
        // Convert blob to File object
        const file = new File([blob], "document.pdf", {
          type: "application/pdf",
        });
        setPdfFile(file);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching PDF:", err);
        setError(err instanceof Error ? err : new Error("Failed to load PDF"));
      }
    }
    fetchPDF();
  }, [url]);

  // If we're loading or have an error, show appropriate UI
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-full">
        <Loader2 className="h-4 w-4 animate-spin" />
        <p>Loading PDF...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-full">
        <Frown className="h-8 w-8 text-muted-foreground" />
        <p>Error loading PDF: {error.message}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline mt-2"
        >
          Open PDF in new tab
        </a>
      </div>
    );
  }

  // Use object tag instead of iframe for better PDF compatibility
  return (
    <div className="pdf-container w-full h-full">
      <object
        data={URL.createObjectURL(pdfFile!)}
        type="application/pdf"
        className="w-full h-full"
        // Add parameters to control viewer appearance
        data-params="toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH"
      >
        <div className="flex flex-col items-center justify-center gap-2 h-full">
          <p>Unable to display PDF directly.</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline mt-2"
          >
            Open PDF in new tab
          </a>
        </div>
      </object>
    </div>
  );
}

// function PDFViewer({ url }: { url: string }) {
//   const [numPages, setNumPages] = useState<number | null>(null);
//   const [error, setError] = useState<Error | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [pdfFile, setPdfFile] = useState<File | null>(null);
//   const [pageNumber, setPageNumber] = useState<number>();

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
//     setPageNumber(1);
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
//     <div className="flex flex-col items-center justify-center p-10  flex-1 overflow-hidden">
//       <Document
//         file={pdfFile}
//         // loading={<IsLoadingView />}
//         onError={(error) => {
//           console.error("PDF loading error:", error);
//           setError(new Error("Failed to load PDF"));
//         }}
//         className="min-h-0    bg-neutral-100 flex flex-1 bg-red-500 items-center justify-center"
//         error={
//           <div className="flex items-center justify-center ">
//             <p>Failed to load PDF</p>
//           </div>
//         }
//         onLoadSuccess={onDocumentLoadSuccess}
//       >
//         {/* <div className="bg-neutral-100 flex flex-col items-center justify-center">
//           {Array.from(new Array(numPages), (_el, index) => (
//             <Thumbnail
//               key={`thumbnail_${index + 1}`}
//               className="custom-classname-thumbnail"
//               pageNumber={index + 1}
//               width={100}
//             />
//           ))}
//         </div> */}
//         <div className="flex flex-1 flex-col overflow-scroll">
//           {!isLoading &&
//             numPages &&
//             Array.from(new Array(numPages), (el, index) => (
//               <Page
//                 key={`page_${index + 1}`}
//                 loading={<IsLoadingView />}
//                 renderTextLayer={true}
//                 renderAnnotationLayer={false}
//                 // className="mx-auto mb-4"
//                 inputRef={
//                   pageNumber === index + 1
//                     ? (ref: HTMLDivElement) => {
//                         ref?.scrollIntoView();
//                       }
//                     : null
//                 }
//                 pageNumber={index + 1}
//                 onLoadError={(error) => {
//                   console.error("Page loading error:", error);
//                   setError(new Error("Failed to load page"));
//                 }}
//                 error={
//                   <div className="flex items-center justify-center h-full">
//                     <p>Failed to load page</p>
//                   </div>
//                 }
//               />
//             ))}
//         </div>
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
