import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { MoreHorizontal } from "lucide-react";

export interface DocumentInterface {
  id: string;
  title: string;
  course_id: string;
  document_type: string;
  file_url: string;
  description?: string;
}

/**
 * Component to represent documents in the resources document listing
 * Takes a DocumentInterface to represent, and click handler as props
 */
export default function Document({document, onClick}: {document: DocumentInterface, onClick: (document: DocumentInterface) => void}) {  
  const handleClick = () => {
    onClick(document)
  }
  
  return (
    <>
      <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent" onClick={handleClick}>
        <div className="flex items-center space-x-3">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{document.title}</span>
            <span className="text-xs text-muted-foreground">{document.description}</span>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </>
  )
} 