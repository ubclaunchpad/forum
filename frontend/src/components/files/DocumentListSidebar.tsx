"use client";

import { ScrollArea } from "@/components/ui/scrollArea";
import DocumentRow from "@/components/files/DocumentRow";
import type {
  DocumentAppendOperation,
  DocumentInterface,
} from "@/lib/types/documents";
import { Dispatch, Fragment, SetStateAction } from "react";
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
  setSelectedFile: (file: DocumentInterface) => void;
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
  return (
    <Fragment>
      <section className="flex relative vt flex-col h-full overflow-y-auto min-w-[500px] max-w-[500px] border-r">
        <ScrollArea className="flex-1 w-full p-2 py-4">
          <ul className="flex flex-col gap-2 p-2 min-w-[476px]">
            {files.map((doc) => (
              <li key={doc.id}>
                <DocumentRow
                  disabled={isPendingId(doc.id)}
                  document={doc}
                  isSelected={selectedFile?.id === doc.id}
                  onClick={() => setSelectedFile(doc)}
                />
              </li>
            ))}
          </ul>
        </ScrollArea>
        <FileUpload
          appendToFiles={appendToFiles}
          onUploadSuccess={onUploadSuccess}
        />
      </section>
    </Fragment>
  );
};
