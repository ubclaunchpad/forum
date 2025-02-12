"use client";

import { Post, PostWithRequiredId } from "@/lib/types/posts";
import PostView from "./PostView";
import { forumPostsContext } from "@/contexts/PostsContext";
import { useContext } from "react";
import { isIDTemporary } from "@/lib/utils";

export const PostsForumViewSection = () => {
  const { selectedPost } = useContext(forumPostsContext);

  if (!selectedPost) {
    return (
      <>
        <div
          className={`xl:flex hidden justify-center flex-1 lg:border-l items-center text-neutral-500 flex-shrink-0 w-full transition-all duration-300 border-neutral-200`}
        >
          Select a post to view
        </div>
      </>
    );
  }

  return (
    <>
      {!isIDTemporary(selectedPost.id) ? (
        <PostView<"published"> post={selectedPost as Post} />
      ) : (
        <PostView<"draft"> post={selectedPost as PostWithRequiredId} />
      )}
    </>
  );
};
