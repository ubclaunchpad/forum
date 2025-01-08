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
  const [selectedFile, setSelectedFile] = useState<DocumentInterface>();
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
    <div className="flex flex-row  w-full relative flex-1">
      <DocumentListSidebar
        files={files}
        setFiles={setFiles}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* <h5 className="font-semibold  w-full border-b p-2 flex items-center ">{post.title}</h5> */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {selectedFile ? (
          <>
            <nav className="flex items-center gap-1 h-12 border-b p-2">
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
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-neutral-500">
            Select a document to view
          </div>
        )}
      </div>
    </div>
  );
}
