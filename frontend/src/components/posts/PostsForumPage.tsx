"use client";

import { Post } from "@/lib/types/posts";
import { PostsForumSidebar } from "./PostsForumSidebar";
import { useState } from "react";
import PostView from "./PostView";

export const PostsForumPage = ({ posts }: { posts: Post[] }) => {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [listofPosts, setListofPosts] = useState<Post[]>(posts);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  function edittingSelectPost(post: Post): void {
    if (isEditing !== post.id) {
      setIsEditing(null);
    }
    setSelectedPost(post);
  }

  return (
    <div className="flex flex-1  overflow-hidden bg-neutral-50 ">
      <div className=" relative flex flex-col">
        <PostsForumSidebar
          posts={listofPosts}
          setSelectedPost={edittingSelectPost}
          selectedPost={selectedPost}
          setListOfPosts={setListofPosts}
          isEditing={isEditing}
        />
      </div>
      <div
        className={`flex justify-center flex-1 border-l  flex-shrink-0 w-full transition-all duration-300 ${selectedPost ? "border-neutral-200" : "border-neutral-200"}`}
      >
        {selectedPost ? (
          <>
            <PostView
              post={selectedPost}
              setListOfPosts={setListofPosts}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
            />
          </>
        ) : (
          <div className="flex-1  w-full items-center flex-col gap-2 p-4 "></div>
        )}
      </div>
    </div>
  );
};
