"use client";

import { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { DocumentListSidebar } from "./DocumentListSidebar";
import { getApiUrl } from "@/utils/helpers";
import { DocumentInterface } from "@/lib/types/documents";
import FileViewer from "./FileViewer";
import { userContext } from "@/contexts/userContext";
import { MainListPanel, MainSidebar } from "../general/FourmTabs";
import { NewDocumentButton } from "./NewDocumentButton";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-row  w-full relative flex-1">
      <MainSidebar className={selectedFile ? "hidden xl:block" : ""}>
        <NewDocumentButton
          setFiles={setFiles}
          onUploadSuccess={handleUploadSuccess}
        />
      </MainSidebar>
      <MainListPanel className={selectedFile ? "hidden xl:block" : ""}>
        <DocumentListSidebar
          files={files}
          setFiles={setFiles}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          onUploadSuccess={handleUploadSuccess}
        />
      </MainListPanel>

      <div
        className={cn(
          "flex flex-col flex-1 overflow-hidden",
          selectedFile ? "" : "xl:flex hidden",
        )}
      >
        {selectedFile ? (
          <>
            <nav className="flex items-center gap-1 h-16 border-b p-2">
              <Button
                className="p-0"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(undefined)}
              >
                <XIcon className="min-w-5 min-h-5 " />
              </Button>

              <h5 className="font-semibold text-sm  w-full  p-2 flex items-center ">
                {selectedFile.title}
              </h5>

              <div className="flex-1" />
            </nav>

            <FileViewer document={selectedFile} />
          </>
        ) : (
          <div className="xl:flex hidden justify-center flex-1 items-center text-neutral-500 flex-shrink-0 w-full transition-all duration-300 border-l border-neutral-200">
            Select a document to view
          </div>
        )}
    </div>
  );
}
