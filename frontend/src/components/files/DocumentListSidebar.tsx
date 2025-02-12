"use client";

import DocumentRow from "@/components/files/DocumentRow";
import type {
  DocumentAppendOperation,
  DocumentInterface,
} from "@/lib/types/documents";
import { Dispatch, Fragment, SetStateAction, useEffect } from "react";
import FileUpload from "@/components/files/NewFileUpload";
import { cn, generateTempId, isPendingId } from "@/lib/utils";
import { TagsSidebar } from "../tags/TagsSidebar";

export const DocumentListSidebar = ({
  files,
  selectedFile,
  setFiles,
  setSelectedFile,
  onUploadSuccess,
}: {
  files: DocumentInterface[];
  setFiles: Dispatch<SetStateAction<DocumentInterface[]>>;
  selectedFile: DocumentInterface | undefined;
  setSelectedFile: Dispatch<
    SetStateAction<DocumentInterface | null | undefined>
  >;
  onUploadSuccess: () => Promise<void>;
}) => {
  function appendToFiles({ operation, id, document }: DocumentAppendOperation) {
    if (operation === "optimistic") {
      const tempId = generateTempId();
      setFiles((prev) => [{ ...document, id: tempId }, ...prev]);
      return tempId;
    } else {
      setFiles((prev) => {
        return prev.map((f) => {
          if (f.id === id) {
            return { ...f, id: document.id };
          }
          return f;
        });
      });
    }
  }

  useEffect(() => {
    if (selectedFile && !files.find((f) => f.id === selectedFile.id)) {
      setSelectedFile(undefined);
    }
  }, [files, selectedFile, setSelectedFile]);

  return (
    <>
    <div
        className={cn(
          "relative flex flex-col",
          "hidden md:block md:min-w-[min(280px,100%)] w-full max-w-0 lg:max-w-[280px]",
          selectedFile ? "hidden xl:block" : "",
        )}
      >
        <div className="flex flex-row justify-center items-center w-full h-16 px-2">
          <FileUpload
            styles="w-full max-w-[150px] min-h-none h-fit py-2"
            appendToFiles={appendToFiles}
            onUploadSuccess={onUploadSuccess}
          />
        </div>
        <TagsSidebar />
      </div>
      <div className={cn(
          "relative flex flex-1 flex-col",
          "min-w-[min(500px,100%)] w-full xl:max-w-[500px] border-l border-b border-neutral-200",
          selectedFile ? "hidden xl:block" : "",
        )}>
        <section className={cn("flex relative flex-col h-full overflow-y-auto")}> 
          <div className="flex items-center h-16 flex-shrink-0 border-b py-2 w-full gap-2">
            <FileUpload
              styles="flex justify-center md:hidden w-full max-w-[150px] min-h-none h-fit py-2"
              appendToFiles={appendToFiles}
              onUploadSuccess={onUploadSuccess}
            />
          </div>
          <ul className="flex flex-col gap-2 p-2">
            {files.map((doc) => (
              <li key={doc.id} className="w-full flex items-center">
                <DocumentRow
                  setDocuments={setFiles}
                  disabled={isPendingId(doc.id)}
                  document={doc}
                  isSelected={selectedFile?.id === doc.id}
                  onClick={() => setSelectedFile(doc)}
                />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
};
