"use client";
import { cn, getIdType, getRelativeTimeString } from "@/lib/utils";
import removeMarkdown from "markdown-to-text";
import { useCourseStore } from "@/providers/courseStoreProvider";
import Link from "next/link";
import { Post } from "@forum/shared";

type PostCardProps = {
  post: Post;
  isSelected: boolean;
};

export const PostCard = ({ post, isSelected }: PostCardProps) => {
  const course = useCourseStore((state) => state.course);
  const postType = getIdType(post.id);

  return (
    <Link
      href={`/forum/courses/${course.id}/forum/${post.id}`}
      shallow={true}
      className={cn(
        "text-left relative border transition-all duration-1000   rounded-lg flex flex-col w-full",
        isSelected
          ? "bg-primary-50 border-primary-200 shadow-xs shadow-primary-200"
          : "border-neutral-200 bg-white",
        "cursor-pointer",
      )}
    >
      <div className="flex items-center justify-between p-2 px-4 w-full gap-2 pb-2">
        <p className="text-sm font-semibold flex-1 truncate">
          {postType === "local" && (
            <span className="border text-xs rounded-md text-neutral-600 dashed p-1 uppercase">
              Draft
            </span>
          )}
          {post.title}
        </p>

        <div className="flex items-center gap-2 shrink-0">
          {post.updated_at && (
            <h2 className="font-medium text-xs whitespace-nowrap">
              {getRelativeTimeString(
                new Date(post.updated_at).getTime(),
                "en",
                30,
              )}
            </h2>
          )}
        </div>
      </div>

      <section className="max-h-40 overflow-hidden px-4">
        <p className="text-xs py-2  text-wrap text-neutral-500 select-none line-clamp-4 break-words">
          {removeMarkdown((post.content ?? "").trim().slice(0, 200) + "...")}
        </p>
      </section>

      <div
        className={cn(
          "flex-row w-full flex px-4  pb-2  items-center  gap-1",
          isSelected ? "border-t-primary-100" : "border-t-neutral-100",
        )}
      >
        <div className="flex flex-1 " />
        <div className="flex flex-1 justify-end ">
          <p className="text-xs text-neutral-700">
            {`Post #${post.number_id} by ${post.authors.map((author) => author.pseudonym).join(", ")}`}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "flex-row w-full flex px-4 h-10 border-t  items-center  gap-1",
          isSelected ? "border-t-primary-100" : "border-t-neutral-100",
        )}
      >
        <div className="flex flex-1 " />
      </div>
    </Link>
  );
};
