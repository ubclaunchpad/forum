"use client";

import { CopyIcon, DeleteIcon, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useContext } from "react";
import { userContext } from "@/providers/userContext";
import { useCourseStore } from "@/providers/courseStoreProvider";
import { getApiUrl } from "@/utils/helpers";
import { GetDocument } from "@forum/shared";

export default function DocumentOptionsPopover({
  document,
  setDocuments,
}: {
  document: GetDocument;
  setDocuments: React.Dispatch<React.SetStateAction<GetDocument[]>>;
}) {
  const user = useContext(userContext);
  const course = useCourseStore((state) => state.course);
  const { toast } = useToast();

  async function handleDelete() {
    const confirmDelete = confirm(
      "Are you sure you want to delete this document?",
    );
    if (!confirmDelete) return;

    const toDelete = document;
    setDocuments((prev) => prev.filter((d) => d.id !== document.id));

    const res = await fetch(
      `${getApiUrl()}/documents/document/${document.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      },
    );
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
    <Popover>
      <PopoverContent
        side="right"
        align="start"
        alignOffset={-10}
        sideOffset={6}
        className="bg-white border w-fit p-0 border-neutral-200 rounded-lg shadow-xs"
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
              className="text-sm flex gap-6 font-medium items-center p-4 py-1 w-full hover:text-red-500 border-b"
            >
              <DeleteIcon className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </li>
        </ul>
      </PopoverContent>
      <PopoverTrigger asChild>
        <button type="button" className="focus:outline-hidden shrink-0 px-2">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </PopoverTrigger>
    </Popover>
  );
}
