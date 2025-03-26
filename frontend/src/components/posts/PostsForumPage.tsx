"use client";

import { Post } from "@/lib/types/posts";
import { ForumContextProvider } from "@/providers/PostsContext";
import PostsForumSidebar from "./PostsForumSidebar";
import { PostsForumViewSection } from "./PostsForumViewSection";

export const PostsForumPage = ({
  posts,
  initalPost,
}: {
  posts: Post[];
  initalPost?: string;
}) => {
  return (
    <ForumContextProvider initialPosts={posts} initialSelectedId={initalPost}>
      <div className="flex flex-1 overflow-hidden  ">
        <PostsForumSidebar />
        <PostsForumViewSection />
      </div>
    </ForumContextProvider>
  );
};
