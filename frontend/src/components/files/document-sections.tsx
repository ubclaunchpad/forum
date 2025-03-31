"use client";

import { GetDocument } from "@forum/shared";
import {
  ArrowRightFromLine,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import Link from "next/link";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function DocumentViewHeaderWrapper({
  children,
  options,
}: {
  children: React.ReactNode;
  options: {
    canNavigateBack: boolean;
    navigateBackUrl: string;
    onNavigateBack?: () => void;
  };
}) {
  return (
    <div className=" w-full h-16 shrink-0 px-2 flex items-center  gap-2">
      <div className="flex  item-center gap-6 flex-1 text-primary-700 ">
        <Link
          href={options.navigateBackUrl}
          className="p-0"
          onClick={options.onNavigateBack ? options.onNavigateBack : undefined}
        >
          <ArrowRightFromLine className="min-w-5 min-h-5 " />
        </Link>
      </div>
      {children}
    </div>
  );
}

export function DocumentPopoverOptions({
  document,
  // isEditing,
  // setIsEditing,
  actions,
}: {
  document: GetDocument;
  // isEditing: boolean;
  // setIsEditing: (isEditing: boolean) => void;
  actions: {
    //   handleSave: () => void;
    handleDelete: () => void;
  };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isEditing = false;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={isEditing}
          variant="ghost"
          size="sm"
          className={cn("px-2", isEditing ? "hidden" : "")}
        >
          <div
            className={cn(
              "flex items-center border text-primary   border-transparent gap-2 p-1",
              isOpen
                ? " border-neutral-200 bg-neutral-50 shadow-sm  rounded-full"
                : "",
            )}
          >
            <MoreHorizontalIcon className={cn("min-w-5  min-h-5")} />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="h-fit mr-2 px-0 py-0 w-fit min-w-[120px] "
      >
        <div className="flex w-full flex-col ">
          <Button
            variant="ghost"
            className="p-0 w-full cursor-pointer  px-2 rounded-none flex items-center gap-2"
            size="sm"
            onClick={actions.handleDelete}
          >
            <TrashIcon className="min-w-4 min-h-4" />
            <span className="text-sm flex-1 text-left ">Delete</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
