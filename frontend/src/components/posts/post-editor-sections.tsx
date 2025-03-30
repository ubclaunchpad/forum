import { cn, getRelativeTimeString } from "@/lib/utils";
import EditorComponent from "../general/EditorComponent";
import { useState } from "react";
import { Post, PostComment } from "@forum/shared";
import {
  ArrowRightFromLine,
  MoreHorizontalIcon,
  PencilIcon,
  ReplyIcon,
  ThumbsUpIcon,
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
    editorClass?: string;
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
        "flex flex-col relative   rounded-xl border  w-full border-[#BDCFCC]  gap-4 items-center ",
        options.isEditing ? "bg-white" : "bg-transparent border-transparent  ",
      )}
    >
      <div
        className={cn(
          "flex  w-full overflow-hidden flex-1 p-2 px-4 py-0 mt-0 w-full flex-col gap-2 border rounded-lg border-transparent",
        )}
      >
        <EditorComponent
          className={options.editorClass}
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

export function PostCommentsSection({ comments }: { comments: PostComment[] }) {
  return (
    <div className="flex gap-2 flex-col py-6 w-full">
      {comments.map((comment) => (
        <PostCommentBox key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
export function PostCommentBox({ comment }: { comment: PostComment }) {
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row justify-between items-center w-full">
        <div className="flex bg-white border border-primary-muted rounded-full  w-fit p-2 px-4">
          <span className="text-sm text-neutral-800 font-medium">
            {comment.authors.map((author) => author.pseudonym).join(", ")}
          </span>
        </div>
        <div className="flex flex-row justify-end text-sm text-neutral-500 w-full">
          {getRelativeTimeString(new Date(comment.created_at))}
        </div>
      </div>
      <div className="flex flex-col px-1 w-full">
        <div className="flex flex-col  border-l-2 border-primary-muted min-h-10 w-full">
          <PostTextBoxSection
            content={comment.content}
            setContent={() => {}}
            options={{
              isEditing: false,
              editable: false,
              editorClass: "text-sm",
            }}
          />
          <div className="flex flex-row w-full">
            <div className="flex flex-row text-primary-700 font-semibold stroke-2 gap-6 px-4 w-full">
              <button className="flex flex-row items-center gap-1">
                <ThumbsUpIcon className="max-w-4 max-h-4" />
              </button>
              <button className="flex flex-row items-center gap-1">
                <ReplyIcon className="max-w-4 max-h-4" />
                <span className="text-sm font-semibold">Reply</span>
              </button>
              <button className="flex flex-row items-center gap-1">
                <MoreHorizontalIcon className="max-w-4 max-h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PostActionRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-row text-primary-700 font-semibold stroke-2 gap-6 px-4 w-full">
      {children}
    </div>
  );
}
