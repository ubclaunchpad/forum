"use client";

import { Post } from "@/lib/types/posts";
import { PostsForumSidebar } from "./PostsForumSidebar";
import { useContext, useState } from "react";
import PostView from "./PostView";
import { useRouter } from "next/navigation";
import { courseContext } from "@/contexts/courseContext";

export const PostsForumPage = ({
  posts,
  initalPost,
}: {
  posts: Post[];
  initalPost?: string;
}) => {
  const course = useContext(courseContext);
  const foundPost = initalPost
    ? posts.find((post) => post.id === initalPost)
    : null;
  const [selectedPost, setSelectedPost] = useState<Post | null>(
    foundPost ? foundPost : null,
  );
  const [listofPosts, setListofPosts] = useState<Post[]>(posts);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const router = useRouter();

  function edittingSelectPost(post: Post): void {
    if (isEditing !== post.id) {
      setIsEditing(null);
    }
    setPostAndRoute(post);
  }

  function setPostAndRoute(post: Post | null): void {
    if (!post) {
      setSelectedPost(null);
      router.push(`/forum/courses/${course.id}/forum`);
      return;
    }
    if (selectedPost) {
      router.push(post.id);
    } else {
      router.push("forum/" + post.id);
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
              setSelectedPost={setPostAndRoute}
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
