import { DocumentInterface } from "@/lib/types/documents";
import { cn } from "@/lib/utils";
import DocumentOptionsPopover from "../course/documents/DocumentOptionsPopover";

export default function DocumentRow({
  document,
  isSelected = false,
  onClick,
  disabled = false,
  setDocuments,
}: {
  document: DocumentInterface;
  isSelected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  setDocuments: React.Dispatch<React.SetStateAction<DocumentInterface[]>>;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      className={cn(
        "text-left border transition-all duration-500 rounded-lg w-full relative overflow-hidden",
        "flex items-center",
        isSelected
          ? "bg-primary-50 border-primary-200 shadow-sm shadow-primary-200"
          : "border-neutral-200 bg-white",
        disabled
          ? "cursor-wait border-dashed border-neutral-200 bg-neutral-100"
          : "cursor-pointer",
      )}
    >
      {/* Main content container */}
      <div className="flex flex-1 p-1 px-2 items-center min-w-0">
        {/* Icon container */}
        {/* <div
          className={cn(
            "flex items-center justify-center border-r p-2 flex-shrink-0",
            isSelected
              ? "bg-inherit border-primary-100 text-primary-400"
              : "bg-neutral-50",
          )}
        >
          <FileText className="h-4 w-4" />
        </div> */}
        {/* Text content container */}
        <div className="flex flex-col min-w-0 flex-1 px-2">
          <span
            className={cn(
              "truncate",
              isSelected ? "text-primary-700" : "text-neutral-800",
            )}
          >
            {document.title}
          </span>
          {document.description && (
            <p className="text-sm text-neutral-500 truncate">
              {document.description}
            </p>
          )}
        </div>
      </div>

      <DocumentOptionsPopover document={document} setDocuments={setDocuments} />

      {/* Loading overlay */}
      {disabled && (
        <div className="absolute inset-0 animate-[shimmer_2s_infinite]">
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-primary-500/10 to-transparent" />
        </div>
      )}
    </div>
  );
}
