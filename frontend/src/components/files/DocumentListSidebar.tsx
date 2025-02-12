"use client";

import DocumentRow from "@/components/files/DocumentRow";
import type { DocumentInterface } from "@/lib/types/documents";
import { Dispatch, SetStateAction, useEffect } from "react";
import { isPendingId } from "@/lib/utils";

export const DocumentListSidebar = ({
  files,
  selectedFile,
  setFiles,
  setSelectedFile,
}: {
  files: DocumentInterface[];
  setFiles: Dispatch<SetStateAction<DocumentInterface[]>>;
  selectedFile: DocumentInterface | null | undefined;
  setSelectedFile: Dispatch<
    SetStateAction<DocumentInterface | null | undefined>
  >;
  onUploadSuccess: () => Promise<void>;
}) => {
  useEffect(() => {
    if (selectedFile && !files.find((f) => f.id === selectedFile.id)) {
      setSelectedFile(null);
    }
  }, [files, selectedFile, setSelectedFile]);

  return (
    <section className="flex relative vt flex-col h-full  overflow-y-auto overflow-x-hidden min-w-[500px] xl:max-w-[500px] xl:border-r">
      <div className="flex justify-center h-16 flex-shrink-0 border-b w-full gap-2"></div>
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
  );
};
