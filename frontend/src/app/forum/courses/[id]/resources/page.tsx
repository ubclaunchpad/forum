"use client";

import { useState, useEffect, useContext, useCallback } from "react";
import FileUpload from "@/components/course/fileUpload";
import Document, { DocumentInterface } from "./document";
import FileViewer from "@/components/file/fileViewer";
import { ScrollArea, ScrollBar } from "@/components/ui/scrollArea";
import { courseContext } from "@/contexts/courseContext";
import { getApiUrl } from "@/utils/helpers";
import { userContext } from "@/contexts/userContext";

export default function ResourcesTab() {
  const { token } = useContext(userContext);
  const [files, setFiles] = useState<DocumentInterface[]>([]);
  const [viewFile, setViewFile] = useState<DocumentInterface>();
  const course = useContext(courseContext);

  const getFiles = useCallback(async () => {
    const link = `${getApiUrl()}/courses/${course.info.id}/documents`;

    const response = await fetch(link, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const result = await response.json();
    setFiles(result);
  }, [course.info.id]);

  useEffect(() => {
    getFiles();
  }, [getFiles]);

  const handleDocClick = (doc: DocumentInterface) => {
    setViewFile(doc);
  };

  return (
    <div className="flex flex-row gap-2 w-full px-2 flex-1 py-4">
      <div className="space-y-2 max-w-lg border rounded-lg p-2 flex flex-col flex-1  items-center">
        <ScrollArea className="flex-1 w-full">
          {files.map((doc) => (
            <Document key={doc.id} document={doc} onClick={handleDocClick} />
          ))}
          <ScrollBar orientation="vertical" />
        </ScrollArea>
        <FileUpload onUploadSuccess={getFiles} />
      </div>

      <div className="flex  flex-1 items-center justify-center rounded-lg border">
        <FileViewer document={viewFile} />
      </div>
    </div>
  );
}
