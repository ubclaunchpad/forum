import { useState, useEffect } from "react"
import FileUpload from '@/components/course/fileUpload'
import Document, { DocumentInterface } from './document'
import FileViewer from '@/components/file/fileViewer';
import { ScrollArea, ScrollBar } from '@/components/ui/scrollArea';

export default function ResourcesTab() {
  const [files, setFiles] = useState<DocumentInterface[]>([]);
  const [viewFile, setViewFile] = useState<DocumentInterface>();

  const getFiles = async () => {
    // hardcoded course id for now, course needs to be added to courses table for query to work
    const link = `${process.env.NEXT_PUBLIC_BACKEND_URL}/courses/1ef384fe-040c-4ba9-813e-dfeb282402bf/documents`;

    const response = await fetch(link, {
      method: "GET"
    });
    const result = await response.json();
    setFiles(result);
  };   

  useEffect(() => {     
    getFiles();
  }, []);

  const handleDocClick = (doc: DocumentInterface) => {
    setViewFile(doc);
  }
  
  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[450px_1fr]">
            {/* File List */}
            <div className="space-y-2 pl-6">
              <ScrollArea className="h-4/5">
                {files.map((doc) => (
                  <Document key={doc.id} document={doc} onClick={handleDocClick}/>
                ))}
                <ScrollBar orientation="vertical"/>
              </ScrollArea>
              <FileUpload onUploadSuccess={getFiles} />
            </div>

            {/* Empty State */}
            <div className="flex h-[500px] items-center justify-center rounded-lg border">
              <FileViewer document={viewFile}/>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}