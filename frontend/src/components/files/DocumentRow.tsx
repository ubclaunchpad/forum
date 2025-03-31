import { cn } from "@/lib/utils";
import { GetDocument } from "@forum/shared";
import { FileText } from "lucide-react";
import PDFIcon from "../customIcons/PDFIcon";
import Link from "next/link";

const getFileIcon = (fileType: string, className?: string) => {
  switch (fileType) {
    case "application/pdf":
      return <PDFIcon className={cn("h-8 w-8 text-primary-600", className)} />;
    default:
      return <FileText className={cn("h-4 w-4", className)} />;
  }
};
export default function DocumentRow({
  document,
  isSelected = false,
  disabled = false,
}: {
  document: GetDocument;
  isSelected?: boolean;
  disabled?: boolean;
}) {
  return (
    <Link
      href={`/forum/courses/${document.course_id}/resources/${document.id}`}
      tabIndex={0}
      className={cn(
        "text-left border transition-all py-2 duration-500 rounded-md shadow-xs hover:bg-primary/10  w-full relative overflow-hidden",
        "flex flex-col w-full items-center",
        isSelected
          ? "bg-primary-50 border-primary-200 shadow-xs shadow-primary-200"
          : "border-neutral-200 bg-white",
        disabled
          ? "cursor-wait border-dashed border-neutral-200 bg-neutral-100"
          : "cursor-pointer",
      )}
    >
      <div className="flex flex-1 w-full items-center min-w-0">
        <div
          className={cn(
            "flex items-center justify-center h-10  p-0 w-10 shrink-0",
            isSelected ? "bg-inherit border-primary-100 text-primary-400" : "",
          )}
        >
          {getFileIcon(document.file?.type, "min-w-8 min-h-8")}
        </div>
        {/* Text content container */}
        <div className="flex flex-col min-w-0 flex-1 justify-start   px-2">
          <span
            className={cn(
              "truncate text-sm",
              isSelected ? "text-primary-700" : "text-neutral-800",
            )}
          >
            {document.file.name}
          </span>

          <p className="text-xs text-neutral-500 flex-shrink-0   truncate">
            {document.description ? document.description : "no description"}
          </p>
        </div>
      </div>

      {/* <DocumentOptionsPopover document={document} setDocuments={setDocuments} /> */}

      {/* Loading overlay */}
      {disabled && (
        <div className="absolute inset-0 animate-[shimmer_2s_infinite]">
          <div className="w-1/2 h-full bg-linear-to-r from-transparent via-primary-500/10 to-transparent" />
        </div>
      )}
    </Link>
  );
}
