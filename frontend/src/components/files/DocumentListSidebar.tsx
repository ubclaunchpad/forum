"use client";

import DocumentRow from "@/components/files/DocumentRow";
import type {
  DocumentAppendOperation,
  DocumentInterface,
} from "@/lib/types/documents";
import { Dispatch, Fragment, SetStateAction, useEffect } from "react";
import FileUpload from "@/components/files/NewFileUpload";
import { generateTempId, isPendingId } from "@/lib/utils";

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
    <Fragment>
      <section className="flex relative vt flex-col h-full  overflow-y-auto overflow-x-hidden min-w-[500px] max-w-[500px] border-r">
        <div className="flex justify-center h-12 flex-shrink-0 border-b w-full gap-2"></div>
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
        <FileUpload
          appendToFiles={appendToFiles}
          onUploadSuccess={onUploadSuccess}
        />
      </section>
    </Fragment>
  );
};
