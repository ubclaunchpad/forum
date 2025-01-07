import { DocumentInterface } from "@/lib/types/documents";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";

export default function DocumentRow({
  document,
  isSelected = false,
  onClick,
  disabled = false,
}: {
  document: DocumentInterface;
  isSelected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "text-left border transition-all duration-500  rounded-lg w-full relative overflow-hidden",
        "flex items-center justify-between",
        isSelected
          ? "bg-primary-50 border-primary-200 shadow-sm shadow-primary-200"
          : "border-neutral-200 bg-white",
        disabled
          ? "cursor-wait border-dashed border-neutral-200 bg-neutral-100"
          : "cursor-pointer",
      )}
    >
      <div className="flex gap-3 items-center flex-1 text-neutral-800 ">
        <div className=" flex items-center justify-center bg-neutral-50 border-r p-2 ">
          <FileText className="h-5 w-5 text-neutral-600" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-md  truncate">{document.title}</span>
          {document.description && (
            <p className="text-sm text-neutral-500 truncate max-w-[400px]">
              {document.description}
            </p>
          )}
        </div>
      </div>
      {/* <div variant="ghost" size="sm" className="ml-2 flex-shrink-0">
        <MoreHorizontal className="h-4 w-4" />
      </div> */}

      {disabled && (
        <div className="absolute inset-0 animate-[shimmer_2s_infinite]">
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-primary-500/10 to-transparent" />
        </div>
      )}
    </button>
  );
}
