import { cn } from "@/lib/utils";
import EditorComponent from "../general/EditorComponent";
import { useContext, useState } from "react";
import { userContext } from "@/providers/userContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Post } from "@forum/shared";
import { getApiUrl } from "@/utils/helpers";
import {
  ArrowRightFromLine,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Link from "next/link";

type PostTextBoxSectionProps = {
  content: string;
  setContent: (content: string) => void;
  options: {
    isEditing?: boolean;
    placeholder?: string;
    editable?: boolean;
  };
};

export function PostTextBoxSection({
  content,
  setContent,
  options,
}: {
  content: string;
  setContent: (content: string) => void;
  options: any;
}) {
  return (
    <div
      className={cn(
        "flex flex-col relative   rounded-xl border  w-full border-[#BDCFCC] pb-4  gap-4 items-center ",
        options.isEditing ? "bg-white" : "bg-transparent border-transparent  ",
      )}
    >
      <div
        className={cn(
          "flex  w-full overflow-hidden flex-1 p-2 px-4 pt-0 mt-0 w-full flex-col gap-2 border rounded-lg border-transparent",
        )}
      >
        <EditorComponent
          markdown={content ?? ""}
          onMarkdownChange={setContent}
          editable={options.editable ?? true}
        />
      </div>
    </div>
  );
}

type PostTitleSectionProps = {
  title: string;
  setTitle: (title: string) => void;
  options: {
    placeholder?: string;
    isEditing?: boolean;
  };
  children?: React.ReactNode;
};

export function PostTitleSection({
  title,
  setTitle,
  options,
  children,
}: PostTitleSectionProps) {
  const titleContent = options.isEditing ? (
    <input
      className={cn(
        "w-full p-2  rounded-lg outline-hidden font-semibold text-lg text-primary-600 bg-white border border-primary-muted",
      )}
      placeholder={options.placeholder}
      value={title}
      onChange={(e) => setTitle(e.target.value)}
    />
  ) : (
    <p className="w-full p-2 px-4 max-w-4xl font-semibold text-lg text-primary-600 whitespace-pre-line">
      {title}
    </p>
  );
  return (
    <div className=" w-full  justify-center flex items-center ">
      <div className="flex-col w-full flex  pt-4 items-center  gap-1">
        <div className="flex items-center gap-2 w-full first:flex-1">
          {titleContent}
          {children}
        </div>
      </div>
    </div>
  );
}

export function PostPopoverOptions({
  post,
  isEditing,
  setIsEditing,
  actions,
}: {
  post: Post;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  actions: {
    handleSave: () => void;
    handleDelete: () => void;
  };
}) {
  const [isOpen, setIsOpen] = useState(false);

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
            className="p-0 w-full border-b  cursor-pointer px-2 rounded-none flex items-center gap-2"
            size="sm"
            onClick={() => {
              setIsEditing(true);
              setIsOpen(false);
            }}
          >
            <PencilIcon className="min-w-4 min-h-4" />
            <span className="text-sm flex-1 text-left ">Edit</span>
          </Button>
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

export function PostContentWrapper({
  children,
  options,
}: {
  children: React.ReactNode;
  options: {
    isEditing?: boolean;
  };
}) {
  return (
    <div
      className={cn(
        "flex flex-col relative   rounded-xl border  w-full border-[#BDCFCC] pb-4  gap-4 items-center ",
        !options.isEditing ? "bg-white" : "bg-transparent border-transparent  ",
      )}
    >
      {children}
    </div>
  );
}

export function PostViewWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`flex justify-center pb-10 flex-1 h-full lg:border-l px-4 overflow-auto  shrink-0 w-full transition-all duration-300 `}
    >
      <div className="flex-1 relative flex flex-col p-4 pt-0 ">
        {children}
        <div className="flex justify-center items-center h-16 shrink-0 border-b py-2 w-full gap-2"></div>
      </div>
    </div>
  );
}

export function PostViewHeaderWrapper({
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

export function PostContentWrapperFooter({
  children,
  options,
}: {
  children: React.ReactNode;
  options: {
    show?: boolean;
  };
}) {
  return (
    <div
      className={cn(
        "flex justify-center items-center shrink-0  py-2 w-full gap-2",
        !options.show ? "hidden" : "",
      )}
    >
      {children}
    </div>
  );
}
