"use client";
import {
  checkPermissionInDomain,
  cn,
  generateTempId,
  PERMISSIONS,
} from "@/lib/utils";
import { PostCard } from "./PostCard";
import { useCallback, useContext, useEffect, useRef } from "react";
import { forumPostsContext } from "@/contexts/PostsContext";
import { Button } from "../ui/button";
import { PostWithRequiredId } from "@/lib/types/posts";
import { MainListPanel, MainSidebar } from "../general/FourmTabs";
import { PlusIcon } from "lucide-react";
import { userContext } from "@/contexts/userContext";
import { useCourseStore } from "@/providers/courseStoreProvider";

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
  const course = useCourseStore((state) => state.course);
  const { profile } = useContext(userContext);

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
      <MainSidebar className={selectedPost ? "hidden xl:block" : ""}>
        <div className="flex flex-row justify-center items-center w-full h-16 px-2">
          {checkPermissionInDomain(
            profile.permissions,
            PERMISSIONS.CREATE_POST,
            course.id,
          ) && (
            <Button
              size={"sm"}
              className="w-fit  px-4 min-h-none h-fit py-2"
              onClick={() => {
                const id = generateTempId("local");
                const post: PostWithRequiredId = { id: id, title: "" };
                setListOfDrafts((prev) => [post, ...prev]);
                setSelectedPost(post);
                setIsEditing(id);
              }}
            >
              <PlusIcon className="h-4 w-4" />
              New Post
            </Button>
          )}
        </div>
      </MainSidebar>
      <MainListPanel className={selectedPost ? "hidden xl:block" : ""}>
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
      </MainListPanel>
    </>
  );
}
