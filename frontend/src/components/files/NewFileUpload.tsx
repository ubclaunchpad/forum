"use client";
import { Button } from "@/components/ui/button";
import { Fragment, useContext, useState } from "react";
import { PlusIcon, Upload, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/utils/helpers";
import { courseContext } from "@/contexts/courseContext";
import { userContext } from "@/contexts/userContext";
import { DocumentAppendOperation } from "@/lib/types/documents";

export default function FileUpload({
  appendToFiles,
  onUploadSuccess,
  styles,
}: {
  appendToFiles: (args: DocumentAppendOperation) => string | undefined;
  onUploadSuccess: () => Promise<void>;
  styles: string;
}) {
  const { token } = useContext(userContext);
  const course = useContext(courseContext);
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const openModal = () => {
    const el = document.getElementById("new-document") as
      | HTMLDialogElement
      | null
      | undefined;
    el?.showModal();
  };

  const closeModal = () => {
    const el = document.getElementById("new-document") as
      | HTMLDialogElement
      | null
      | undefined;
    el?.close();
    setTitle("");
    setFile(null);
  };

  const handleSubmit = async () => {
    if (!file || !title) return;

    try {
      const link = `${getApiUrl()}/courses/${course.id}/documents`;
      const data = new FormData();
      data.append("file", file);
      data.append("title", title);
      data.append(
        "metadata",
        JSON.stringify({
          tags: [],
        }),
      );

      closeModal();

      const tempId = appendToFiles({
        operation: "optimistic",
        id: null,
        document: {
          title,
          description: "",
          course_id: course.id,
        },
      });

      if (!tempId) {
        throw new Error("Failed to add document");
      }

      const response = await fetch(link, {
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(
          `HTTP Error ${response.status}: ${errorDetails.message || "Something went wrong"}`,
        );
      }

      const result = await response.json();
      appendToFiles({
        operation: "real",
        id: tempId,
        document: result,
      });

      toast({
        title: "Document Added",
        description: `"${title}" has been added to your course`,
      });

      await onUploadSuccess();

      // Revalidate the documents cache
      fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId: course.id, type: "documents" }),
      });
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
    <Fragment>
      <div className="flex flex-row justify-center items-center w-full h-16 px-2">
        <Button
          className = {styles}
          onClick={openModal}
        >
          New File
        </Button>
      </div>
      <dialog
        className="min-w-[400px] max-w-full max-h-[90dvh] border shadow-sm rounded-xl  bg-white top-1/2 transform -translate-y-1/2"
        id="new-document"
      >
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <button onClick={closeModal}>
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          <form className="flex flex-col min-w-[600px] gap-4 overflow-auto flex-1">
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title"
              className="p-2 text-md border-t-0 border-x-0 border-neutral-200 bg-inherit border-b rounded-none py-6"
            />

            <div className="p-4 flex-1 flex flex-col ">
              <div className="flex flex-1 flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 gap-4">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <Upload className="w-12 h-12 text-neutral-400" />
                <div className="text-center">
                  <label
                    htmlFor="file-upload"
                    className="text-sm text-primary cursor-pointer hover:text-primary-600"
                  >
                    browse for a file
                  </label>
                </div>
              </div>
            </div>
          </form>

          <div className="flex justify-end p-4 h-20 border-t items-center flex-shrink-0">
            <Button
              disabled={!title || !file}
              className="self-end"
              onClick={handleSubmit}
            >
              Upload Document
            </Button>
          </div>
        </div>
      </dialog>
    </Fragment>
  );
}
