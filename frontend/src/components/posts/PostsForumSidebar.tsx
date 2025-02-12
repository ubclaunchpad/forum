"use client";
import { cn, generateTempId } from "@/lib/utils";
import { PostCard } from "./PostCard";
import { useCallback, useContext, useEffect, useRef } from "react";
import { forumPostsContext } from "@/contexts/PostsContext";
import { Button } from "../ui/button";
import { PostWithRequiredId } from "@/lib/types/posts";
import { TagsSidebar } from "../tags/TagsSidebar";

export default function PostsForumSidebar() {
  const {
    selectedPost,
    drafts,
    setIsEditing,
    setSelectedPost,
    listofPosts: posts,
    setDrafts: setListOfDrafts,
  } = useContext(forumPostsContext);

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    const savedScroll = sessionStorage.getItem("forumlist");
    if (savedScroll && scrollRef.current) {
      scrollRef.current.scrollTop = parseInt(savedScroll);
    }
  }, []);

  // Track current scroll position in ref
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      scrollPositionRef.current = scrollRef.current.scrollTop;
    }
  }, []);

  return (
    <>
      <div
        className={cn(
          "relative flex flex-col",
          "hidden md:block md:min-w-[min(280px,100%)] w-full max-w-0 lg:max-w-[280px] border-r",
          selectedPost ? "hidden xl:block" : "",
        )}
      >
        <div className="flex flex-row justify-center items-center w-full h-16 px-2">
          <Button
            className="w-full max-w-[150px] min-h-none h-fit py-2"
            onClick={() => {
              const id = generateTempId("local");
              const post: PostWithRequiredId = { id: id, title: "" };
              setListOfDrafts((prev) => [post, ...prev]);
              setSelectedPost(post);
              setIsEditing(id);
            }}
          >
            New Post
          </Button>
        </div>
        <TagsSidebar />
      </div>
      <div
        className={cn(
          "relative flex flex-1 flex-col",
          "min-w-[min(500px,100%)] w-full xl:max-w-[500px]",
          selectedPost ? "hidden xl:block" : "",
        )}
      >
        <section
          ref={scrollRef}
          onScroll={handleScroll}
          style={{ scrollBehavior: "auto" }}
          className={cn("flex relative flex-col h-full overflow-y-auto")}
        >
          <div className="flex justify-center items-center h-16 flex-shrink-0 border-b py-2 w-full gap-2">
            <Button
              className="flex md:hidden w-full max-w-[150px] min-h-none h-fit py-2"
              onClick={() => {
                const id = generateTempId("local");
                const post: PostWithRequiredId = { id: id, title: "" };
                setListOfDrafts((prev) => [post, ...prev]);
                setSelectedPost(post);
                setIsEditing(id);
              }}
            >
              New Post
            </Button>
          </div>
          <ul className="flex flex-col gap-2 p-2">
            {drafts.map((post) => (
              <li key={post.id}>
                <PostCard<"draft">
                  post={post}
                  isSelected={selectedPost?.id === post.id}
                />
              </li>
            ))}
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard<"published">
                  post={post}
                  isSelected={selectedPost?.id === post.id}
                />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
