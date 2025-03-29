"use client";
import {
  cn,
  generateTempId,
} from "@/lib/utils";
import { PostCard } from "./PostCard";
import { Button } from "../ui/button";
import { PostWithRequiredId } from "@/lib/types/posts";
import { MainListPanel, MainSidebar } from "../general/FourmTabs";
import { PlusIcon } from "lucide-react";
import { useCourseStore } from "@/providers/courseStoreProvider";
import { useState } from "react";

export default function PostsForumSidebar({selectedPost}: {selectedPost?: string}) {
  const { posts } = useCourseStore((state) => state);
  const [focusedPost, setFocusedPost] = useState<string | undefined>(posts.find((post) => post.id === selectedPost)?.id);

  return (
    <>
      <MainSidebar className={false ? "hidden xl:block" : ""}>
        <div className="flex flex-row justify-center items-center w-full h-16 px-2">
          <Button
            className="w-fit  px-4 min-h-none h-fit py-2"
            onClick={() => {
              const id = generateTempId("local");
              const post: PostWithRequiredId = { id: id, title: "" };
              // setListOfDrafts((prev) => [post, ...prev]);
              // setSelectedPost(post);
              // setIsEditing(id);
            }}
          >
            <PlusIcon className="h-4 w-4" />
            New Post
          </Button>
        </div>
      </MainSidebar>
      <MainListPanel className={false ? "hidden xl:block" : ""}>
        <section
          className={cn("flex bg-white relative flex-col h-full overflow-y-auto")}
        >
          <div className="flex justify-center items-center h-16 shrink-0 border-b py-2 w-full gap-2">
            <Button
              className="flex md:hidden w-full max-w-[150px] min-h-none h-fit py-2"
              onClick={() => {
                const id = generateTempId("local");
                const post: PostWithRequiredId = { id: id, title: "" };
                // setListOfDrafts((prev) => [post, ...prev]);
                // setSelectedPost(post);
                // setIsEditing(id);
              }}
            >
              New Post
            </Button>
          </div>
          <ul className="flex flex-col  gap-2 p-2">
            {/* {drafts.map((post) => (
              <li key={post.id}>
                <PostCard<"draft">
                  post={post}
                  isSelected={selectedPost?.id === post.id}
                />
              </li>
            ))} */}
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard<"published">
                  post={post}
                  isSelected={focusedPost === post.id}
                />
              </li>
            ))}
          </ul>
        </section>
      </MainListPanel>
    </>
  );
}
