"use client";

import ChatQ from "@/app/playground/search/chat";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { devNull } from "os";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function QueryPageTest() {
  const [docLink, setDocLink] = useState<{ page: number; file: string } | null>(
    devNull,
  );

  function updateDocLink(link: string, pageNumber: number) {
    setDocLink({ page: pageNumber, file: link });
  }

  function updatePageNumber(pageNumber: number) {
    if (!docLink) return;
    setDocLink({ page: pageNumber, file: docLink.file });
  }
  return (
    <div className="min-h-screen  max-h-dvh  bg-gradient-to-l from-primary-2  to-white  to-80% ">
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-dvh max-h-dvh "
      >
        <ResizablePanel>
          <ChatQ setDocLink={updateDocLink} />
        </ResizablePanel>
        <ResizableHandle />
        {docLink && (
          <ResizablePanel className=" flex-shrink-0 flex-1 ">
            <PdfIframe docLink={docLink} updatePageNumber={updatePageNumber} />
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    </div>
  );
}

function PdfIframe({
  docLink,
  updatePageNumber,
}: {
  docLink: { page: number; file: string };
  updatePageNumber: (pageNumber: number) => void;
}) {
  const [numPages, setNumPages] = useState<number>();
  const pageNumber = docLink.page;
  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  return (
    <div className="max-h-full h-full p-4  pt-8  flex flex-col items-center">
      <Document
        className={"flex-1 flex-shrink-0"}
        file={docLink.file}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <Page
          className={
            "rounded-2xl border shadow-sm border-primary-2 overflow-hidden"
          }
          width={800}
          renderAnnotationLayer={false}
          renderTextLayer={false}
          pageNumber={pageNumber}
        />
      </Document>
      <div className="flex gap-4 justify-between pl-4 w-full">
        <Input
          className="max-w-[60px] w-fit bg-blue-100 text-center bg-opacity-30 rounded-2xl"
          placeholder="Go to page (1-76)"
          value={pageNumber}
          onChange={(e) => updatePageNumber(Number(e.target.value))}
        />
        <div className="flex gap-4">
          <Button
            size={"sm"}
            onClick={() => updatePageNumber(pageNumber - 1)}
            disabled={pageNumber === 1}
          >
            Previous
          </Button>
          <Button
            disabled={pageNumber === numPages}
            size={"sm"}
            onClick={() => updatePageNumber(pageNumber + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
