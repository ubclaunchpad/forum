import { DocumentInterface } from "@/lib/types/documents";
import { cn } from "@/lib/utils";
import { FileText, MoreHorizontal, CopyIcon, DeleteIcon } from "lucide-react";
import { useContext } from "react";
import { userContext } from "@/contexts/userContext";
import { courseContext } from "@/contexts/courseContext";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/utils/helpers";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const user = useContext(userContext);
  const course = useContext(courseContext);
  const { toast } = useToast();

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  async function handleDelete() {
    const confirmDelete = confirm(
      "Are you sure you want to delete this document?",
    );
    if (!confirmDelete) return;

    const toDelete = document;
    setDocuments((prev) => prev.filter((d) => d.id !== document.id));

    const res = await fetch(
      `${getApiUrl()}/courses/${course.id}/documents/${document.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      },
    );

    // Revalidate the course data
    fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courseId: course.id }),
    });

    if (!res.ok) {
      toast({
        title: "Failed to delete document",
      });
      setDocuments((prev) => [...prev, toDelete]);
    }
  }

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
      <div className="flex flex-1 items-center min-w-0">
        {/* Icon container */}
        <div
          className={cn(
            "flex items-center justify-center border-r p-2 flex-shrink-0",
            isSelected
              ? "bg-inherit border-primary-100 text-primary-400"
              : "bg-neutral-50",
          )}
        >
          <FileText className="h-4 w-4" />
        </div>
        {/* Text content container */}
        <div className="flex flex-col min-w-0 flex-1 px-2">
          <span
            className={cn(
              "text-sm truncate",
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
      {/* Actions container */}
      <Popover>
        <PopoverContent
          side="right"
          align="start"
          alignOffset={-10}
          sideOffset={6}
          className="bg-white border w-fit p-0 border-neutral-200 rounded-lg shadow-sm"
        >
          <ul className="flex p-0 flex-col text-neutral-700 w-full">
            <li>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(document.id);
                  toast({
                    title: "Copied ID",
                  });
                }}
                className="flex gap-6 font-medium items-center border-b text-sm p-4 py-1 w-full hover:text-primary-500"
              >
                <CopyIcon className="h-4 w-4" />
                <span>Copy ID</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={handleDelete}
                className="text-sm flex gap-6 font-medium items-center p-4 py-1 w-full hover:text-red-500"
              >
                <DeleteIcon className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </li>
          </ul>
        </PopoverContent>
        <PopoverTrigger asChild>
          <button
            type="button"
            onClick={handleMoreClick}
            className="focus:outline-none flex-shrink-0 px-2"
            disabled={disabled}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </PopoverTrigger>
      </Popover>
      {/* Loading overlay */}
      {disabled && (
        <div className="absolute inset-0 animate-[shimmer_2s_infinite]">
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-primary-500/10 to-transparent" />
        </div>
      )}
    </div>
  );
}
