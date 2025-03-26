"use client";

import type {
  DocumentAppendOperation,
} from "@/lib/types/documents";
import { Dispatch, SetStateAction } from "react";
import FileUpload from "@/components/files/NewFileUpload";
import { generateTempId } from "@/lib/utils";
import { GetDocument } from "@forum/shared";

export const NewDocumentButton = ({
  setFiles,
  onUploadSuccess,
}: {  
  setFiles: Dispatch<SetStateAction<GetDocument[]>>;
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
    <div className="flex flex-row justify-center items-center w-full h-16 px-2">
      <FileUpload
        appendToFiles={appendToFiles}
        onUploadSuccess={onUploadSuccess}
      />
    </div>
  );
};
