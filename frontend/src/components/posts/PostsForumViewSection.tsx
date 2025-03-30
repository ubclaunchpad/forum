"use client";

import PostView, { PostMutatationEditor } from "./PostView";
import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/utils/helpers";
import { Post } from "@forum/shared";
import { Loader2 } from "lucide-react";
import { userContext } from "@/providers/userContext";
import { useCourseStore } from "@/providers/courseStoreProvider";

export const PostsForumViewSection = ({
  initialPost,
}: {
  initialPost?: string;
}) => {
  const postDraft = useCourseStore((state) => state.postDraft);

  if (postDraft) {
    return <PostMutatationEditor />;
  }

  if (!initialPost) {
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

  return <PostToView initialPost={initialPost} />;
};

function PostToView({ initialPost }: { initialPost?: string }) {
  const posts = useCourseStore((state) => state.posts);
  const id = posts.find((post) => post.id === initialPost)?.id;
  const { token } = useContext(userContext) as { token: string };
  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["post", id],

    queryFn: () =>
      fetch(`${getApiUrl()}/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json()),
  });

  if (isLoading) {
    return (
      <div className="flex w-full border-l border-neutral-200 justify-center items-center">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div>{error.message}</div>
      </div>
    );
  }

  return <PostView post={post} />;
}
