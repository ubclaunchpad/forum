import PDFIcon from "@/components/customIcons/PDFIcon";
import { FileText, File } from "lucide-react";
import { cn } from "./utils";

export default function IconFetcher({
  type,
  className,
}: {
  type?: string;
  className?: string;
}) {
  const icon = () => {
    switch (type) {
      case "application/pdf":
        return (
          <PDFIcon className={cn("h-8 w-8 text-primary-600", className)} />
        );
      case "post":
        return <FileText className={cn("h-4 w-4", className)} />;
      case "document":
        return <File className={cn("h-4 w-4", className)} />;
      default:
        return <File className={cn("h-4 w-4", className)} />;
    }
  };

  return icon();
}
