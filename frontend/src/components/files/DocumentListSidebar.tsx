"use client";

import DocumentRow from "@/components/files/DocumentRow";
import { GetDocument } from "@forum/shared";
import { Dispatch, SetStateAction } from "react";
import { isPendingId } from "@/lib/utils";

export const DocumentListSidebar = ({
  files,
  selectedFile,
  setFiles,
  handleFileClick,
}: {
  files: GetDocument[];
  setFiles: Dispatch<SetStateAction<GetDocument[]>>;
  selectedFile: GetDocument | null | undefined;
  handleFileClick: (fileId?: string) => void;
  onUploadSuccess: () => Promise<void>;
}) => {

  return (
    <section className="flex relative vt flex-col   overflow-y-auto overflow-x-hidden min-w-[500px] xl:max-w-[500px] xl:border-r">
      <div className="flex justify-center h-16 flex-shrink-0 border-b w-full gap-2"></div>
      <ul className="flex flex-col gap-2 p-2">
        {files?.map((doc) => (
          <li key={doc.id} className="w-full flex items-center">
            <DocumentRow
              setDocuments={setFiles}
              disabled={isPendingId(doc.id)}
              document={doc}
              isSelected={selectedFile?.id === doc.id}
              onClick={() => handleFileClick(doc.id)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
};
