"use client";

import FileUpload from "@/components/files/NewFileUpload";

export const NewDocumentButton = () => {
  return (
    <div className="flex flex-row justify-center items-center w-full h-16 px-2">
      <FileUpload />
    </div>
  );
};
