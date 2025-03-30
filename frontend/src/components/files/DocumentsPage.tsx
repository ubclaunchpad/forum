"use client";

import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { DocumentListSidebar } from "./DocumentListSidebar";
import { getApiUrl } from "@/utils/helpers";
import FileViewer from "./FileViewer";
import { userContext } from "@/providers/userContext";
import { MainListPanel, MainSidebar } from "../general/FourmTabs";
import { NewDocumentButton } from "./NewDocumentButton";
import { cn } from "@/lib/utils";
import { GetDocument } from "@forum/shared";
import { useSearchParams, useRouter } from "next/navigation";

export function DocumentsPage({
  initialDocuments,
  courseId,
}: {
  initialDocuments: GetDocument[];
  courseId: string;
}) {
  const searchParams = useSearchParams();
  const fileId = searchParams.get("fileId");
  const router = useRouter();
  const [files, setFiles] = useState<GetDocument[]>(initialDocuments);
  const [selectedFile, setSelectedFile] = useState<GetDocument | null>(
    fileId ? files.find((file) => file.id === fileId) || null : null,
  );
  const user = useContext(userContext);
  useEffect(() => {
    setSelectedFile(files.find((file) => file.id === fileId) || null);
  }, [fileId]);

  const handleUploadSuccess = async () => {
    // You could either fetch new data here or handle optimistic updates
    const response = await fetch(
      `${getApiUrl()}/documents/courses/${courseId}`,
      {
        headers: {
          "Cache-Control": "no-cache",
          Authorization: `Bearer ${user.token}`,
        },
      },
    );
    const newDocuments = await response.json();
    setFiles(newDocuments.documents);
  };

  function handleFileClick(fileId?: string) {
    if (fileId) {
      setSelectedFile(files.find((file) => file.id === fileId) || null);
      router.push(`/forum/courses/${courseId}/resources?fileId=${fileId}`);
    } else {
      setSelectedFile(null);
      router.push(`/forum/courses/${courseId}/resources`);
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex flex-row w-full relative flex-1">
        <MainSidebar className={selectedFile ? "hidden xl:flex" : ""}>
          <NewDocumentButton
            setFiles={setFiles}
            onUploadSuccess={handleUploadSuccess}
          />
        </MainSidebar>
        <MainListPanel
          className={cn(selectedFile ? "hidden  xl:flex" : "", "bg-white")}
        >
          <DocumentListSidebar
            files={files}
            setFiles={setFiles}
            selectedFile={selectedFile}
            onUploadSuccess={handleUploadSuccess}
            handleFileClick={handleFileClick}
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
              <nav className="flex shrink-0 items-center gap-1 h-16 border-b border-transparent p-2">
                <Button
                  className="p-0"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFileClick()}
                >
                  <XIcon className="min-w-5 min-h-5 " />
                </Button>

                <h5 className="font-semibold text-sm  w-full  p-2 flex items-center ">
                  {selectedFile.file.name}
                </h5>

                <div className="flex-1" />
              </nav>

              <div className="flex flex-col flex-1 overflow-hidden">
                <FileViewer document={selectedFile} />
              </div>
            </>
          ) : (
            <div className="xl:flex hidden justify-center flex-1 items-center text-neutral-500 shrink-0 w-full transition-all duration-300 border-l border-neutral-200">
              Select a document to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
