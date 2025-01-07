"use client";

import { NewPost } from "@/components/posts/NewPost";
import { AppendOperation, Post } from "@/lib/types/posts";
import { cn, generateTempId, isPendingId } from "@/lib/utils";
import removeMarkdown from "markdown-to-text";
import { Dispatch, Fragment, SetStateAction } from "react";

export const PostsForumSidebar = ({
  posts,
  setSelectedPost,
  selectedPost,
  setListOfPosts,
  isEditing,
}: {
  posts: Post[];
  setSelectedPost: (post: Post) => void;
  selectedPost: Post | null;
  isEditing: string | null;
  setListOfPosts: Dispatch<SetStateAction<Post[]>>;
}) => {
  function appendToPosts({ operation, id, post }: AppendOperation) {
    if (operation === "optimistic") {
      const tempId = generateTempId();
      setListOfPosts((prev) => [
        { ...post, id: tempId, created_by: null },
        ...prev,
      ]);
      return tempId;
    } else {
      setListOfPosts((prev) => {
        return prev.map((p) => {
          if (p.id === id) {
            return { ...p, id: post.id };
          }
          return p;
        });
      });
    }
  }
  return (
    <Fragment>
      <section className="flex relative vt flex-col h-full overflow-y-auto min-w-[500px] max-w-[500px] p-2 py-4">
        <div className="flex justify-center w-full gap-2"></div>

        <ul className="flex flex-col gap-4 p-2 min-w-[476px]">
          {posts.map((post) => (
            <li key={post.id}>
              <button
                disabled={isPendingId(post.id)}
                onClick={() => setSelectedPost(post)}
                className={cn(
                  `text-left relative border transition-all duration-500 p-2 px-4 rounded-lg flex flex-col w-full`,
                  selectedPost?.id === post.id
                    ? "bg-primary-50 border-primary-200 shadow-sm shadow-primary-200"
                    : "border-neutral-200 bg-white",
                  isPendingId(post.id) || isEditing === post.id
                    ? "cursor-wait border-dashed border-neutral-200 bg-neutral-100"
                    : "cursor-pointer",
                )}
              >
                <p className="text-md font-semibold pb-2">{post.title}</p>
                <section className="max-h-40 overflow-hidden">
                  <p className={`text-sm min-h-12 text-neutral-500`}>
                    {isEditing === post.id
                      ? "Editing..."
                      : removeMarkdown(
                          post.content.trim().slice(0, 200) + "...",
                        )}
                  </p>
                </section>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <NewPost appendToPosts={appendToPosts} />
    </Fragment>
  );
};
