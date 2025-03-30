import { Button } from "@/components/ui/button";
import { useContext, useState } from "react";
import { PlusIcon, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/utils/helpers";
import { userContext } from "@/providers/userContext";
import { DocumentAppendOperation } from "@/lib/types/documents";
import { useCourseStore } from "@/providers/courseStoreProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const MAX_FILE_SIZE = 15 * 1024 * 1024;

const fileSchema = z.object({
  file: z
    .custom<File>()
    .refine((file) => file !== null, "File is required")
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      "File size must be less than 15MB",
    )
    .refine(
      (file) => file.type === "application/pdf",
      "Only PDF files are allowed",
    ),
  title: z.string().min(1, "Title is required"),
});

export default function UploadFile({
  appendToFiles,
  onUploadSuccess,
}: {
  appendToFiles: (args: DocumentAppendOperation) => string | undefined;
  onUploadSuccess: () => Promise<void>;
}) {
  const { token } = useContext(userContext);
  const course = useCourseStore((state) => state.course);
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFile = (file: File, title: string) => {
    try {
      fileSchema.parse({ file, title });
      setValidationError(null);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationError(error.errors[0].message);
      }
      return false;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (file.type === "application/pdf" && file.size <= MAX_FILE_SIZE) {
      setFile(file);
      setTitle(file.name);
      setValidationError(null);
    } else {
      if (file.type !== "application/pdf") {
        setValidationError("Only PDF files are allowed");
      } else if (file.size > MAX_FILE_SIZE) {
        setValidationError("File size must be less than 15MB");
      }
      setFile(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file || !title) {
      setValidationError("Title and file are required");
      return;
    }
    if (!validateFile(file, title)) return;

    try {
      setIsLoading(true);
      const link = `${getApiUrl()}/documents/courses/${course.id}`;
      const data = new FormData();
      data.append("file", file);
      data.append("title", title);
      data.append("metadata", JSON.stringify({ tags: [] }));

      const response = await fetch(link, {
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsLoading(false);
      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(
          `HTTP Error ${response.status}: ${errorDetails.message || "Something went wrong"}`,
        );
      }

      setOpen(false);
      toast({
        title: "Success",
        description: `"${title}" has been uploaded`,
      });

      await onUploadSuccess();
      // Reset form
      setTitle("");
      setFile(null);
      setValidationError(null);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size={"lg"}
          className="w-fit font-semibold px-4 min-h-none h-fit py-2"
        >
          <PlusIcon className="min-h-5 min-w-5" />
          Upload File
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex flex-col gap-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle>...</CardTitle>
                <CardContent>
                  <p>Uploading file...</p>
                </CardContent>
              </CardHeader>
            </Card>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 py-4">
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title"
                className="text-md"
              />

              <div
                className={cn(
                  "relative flex flex-col  items-center justify-center border-2 border-dashed rounded-lg p-8 gap-2 min-h-[200px] md:min-h-[300px]",
                  "transition-all duration-200 ease-in-out",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-neutral-200",
                  "hover:border-primary/50 hover:bg-neutral-50",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
                {file ? (
                  <div className="text-center space-y-1.5">
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                      className="h-8 text-xs"
                    >
                      Change file
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-muted-foreground/50 mb-2" />
                    <div className="text-center space-y-1">
                      <div className="text-sm text-muted-foreground">
                        <label
                          htmlFor="file-upload"
                          className="text-primary font-medium cursor-pointer hover:text-primary/80"
                        >
                          Choose a file
                        </label>{" "}
                        or drag and drop
                      </div>
                      <p className="text-xs text-muted-foreground">
                        PDF only, up to 15MB
                      </p>
                    </div>
                  </>
                )}
              </div>

              {validationError && (
                <p className="text-sm text-destructive">{validationError}</p>
              )}

              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    setTitle("");
                    setFile(null);
                    setValidationError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!title || !file}
                  onClick={handleSubmit}
                >
                  Upload
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
