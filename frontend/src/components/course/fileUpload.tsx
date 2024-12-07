"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useContext, useState } from "react";
import { Upload } from "lucide-react";
import { UploadDocumentForm } from "../file/uploadFileForm";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/utils/helpers";
import { courseContext } from "@/contexts/courseContext";

// const maxSizeBytes: number = 15728640; // 15MB
// const acceptedMimeTypes: string[] = [
//   "application/pdf",
//   "application/json",
//   "text/plain",
//   "text/csv",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
//   "application/vnd.ms-powerpoint",
//   "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//   "application/vnd.openxmlformats-officedocument.presentationml.template",
//   "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
//   "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
//   "application/vnd.ms-word.document.macroEnabled.12",
// ];

export default function FileUpload({
  onUploadSuccess,
}: {
  onUploadSuccess: () => Promise<void>;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const course = useContext(courseContext);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const { toast } = useToast();

  const handleSubmit = (file: File, title: string) => {
    const fetchData = async () => {
      try {
        //hardcoded course id for now, must add course to table in order for query to work
        const link = `${getApiUrl()}/courses/${course.info.id}/documents`;
        const data = new FormData();
        data.append("file", file);
        data.append("title", title);
        data.append(
          "metadata",
          JSON.stringify({
            tags: [],
          }),
        );

        const response = await fetch(link, {
          method: "POST",
          body: data,
        });

        if (!response.ok) {
          const errorDetails = await response.json();
          throw new Error(
            `HTTP Error ${response.status}: ${errorDetails.message || "Something went wrong"}`,
          );
        }

        toast({
          title: "Document Added",
          description: `\"${title}\" has been added to your course`,
          variant: "default",
        });
        onUploadSuccess();
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast({
            title: "Error",
            description: `Failed to display document: ${error.message}`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "An unknown error occurred",
            variant: "destructive",
          });
        }
      }
    };
    fetchData();
    closeModal();
  };

  return (
    <>
      <Button className="w-fit" onClick={openModal}>
        <Upload />
        Upload Document
      </Button>
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Document Upload">
        <UploadDocumentForm onCancel={closeModal} onSubmit={handleSubmit} />
      </Modal>
    </>
  );
}
