"use client";

import { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { DocumentListSidebar } from "./DocumentListSidebar";
import { getApiUrl } from "@/utils/helpers";
import { DocumentInterface } from "@/lib/types/documents";
import FileViewer from "./FileViewer";
import { userContext } from "@/contexts/userContext";

export function DocumentsPage({
  initialDocuments,
  courseId,
}: {
  initialDocuments: DocumentInterface[];
  courseId: string;
}) {
  const [files, setFiles] = useState<DocumentInterface[]>(initialDocuments);
  const [selectedFile, setSelectedFile] = useState<DocumentInterface | null>();
  const user = useContext(userContext);

  const handleUploadSuccess = async () => {
    // You could either fetch new data here or handle optimistic updates
    const response = await fetch(
      `${getApiUrl()}/courses/${courseId}/documents`,
      {
        headers: {
          "Cache-Control": "no-cache",
          Authorization: `Bearer ${user.token}`,
        },
      },
    );
    const newDocuments = await response.json();
    setFiles(newDocuments);
  };

  return (
    <div className="flex flex-1 overflow-hidden bg-neutral-50 ">
      <DocumentListSidebar
        files={files}
        setFiles={setFiles}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        onUploadSuccess={handleUploadSuccess}
      />

      {selectedFile ? (
          <div className="flex flex-col flex-1 overflow-hidden border-l border-neutral-200">
            <nav className="flex items-center gap-1 h-12 border-b py-8 px-4">
              <Button
                onClick={() => setSelectedFile(undefined)}
                variant="ghost"
                className="border rounded-lg h-fit w-fit p-1 text-neutral-700 px-1 py-1 hover:bg-neutral-100"
                size="sm"
              >
                <XIcon className="min-h-5 min-w-5" />
              </Button>
              <h5 className="font-semibold text-sm  w-full  p-2 flex items-center ">
                {selectedFile.title}
              </h5>

              <div className="flex-1" />
              <Button
                size="sm"
                variant="outline"
                disabled
                className="cursor-not-allowed py-2 px-4"
              >
                Download
              </Button>
            </nav>
            <div className="flex-1 overflow-hidden">
              <FileViewer document={selectedFile} />
            </div>
          </div>
        ) : (
          <div className="xl:flex hidden justify-center flex-1 items-center text-neutral-500 flex-shrink-0 w-full transition-all duration-300 border-l border-neutral-200">
            Select a document to view
          </div>
        )}
    </div>
  );
}
