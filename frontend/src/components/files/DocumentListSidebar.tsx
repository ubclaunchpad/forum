"use client";

import DocumentRow from "@/components/files/DocumentRow";
import { GetDocument } from "@forum/shared";
import { isPendingId } from "@/lib/utils";
import { Button } from "../ui/button";
import { ChevronDownIcon } from "lucide-react";

export const DocumentListSidebar = ({
  files,
  selectedFile,
}: {
  files: GetDocument[];
  selectedFile: GetDocument | null | undefined;
}) => {
  return (
    <section className="flex relative vt flex-col   overflow-y-auto overflow-x-hidden min-w-[500px] xl:max-w-[500px] ">
      <div className="flex justify-center items-center h-14 shrink-0  py-2 pt-4 w-full gap-2">
        <div className="flex flex-row items-center px-4 gap-2 w-full">
          <span className="text-xs ">Sort by</span>
          <div className="flex flex-1 flex-row gap-2">
            <Button variant="ghost" className="font-semibold" size="sm">
              Most Recent
              <ChevronDownIcon className="h-4 w-4" />
            </Button>

            <div className="flex flex-1 flex-shrink-0 items-center gap-2">
              <div className="min-h-[1px] rounded-full w-full bg-neutral-400" />
            </div>

            <Button variant="ghost" className="font-semibold" size="sm">
              All Documents
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <ul className="flex flex-col gap-2 p-2">
        {files?.map((doc) => (
          <li key={doc.id} className="w-full flex items-center">
            <DocumentRow
              disabled={isPendingId(doc.id)}
              document={doc}
              isSelected={selectedFile?.id === doc.id}
            />
          </li>
        ))}
      </ul>
    </section>
  );
};
