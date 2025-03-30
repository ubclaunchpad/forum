"use client";
import { cn } from "@/lib/utils";
import { PostCard } from "./PostCard";
import { Button } from "../ui/button";
import { MainListPanel, MainSidebar } from "../general/FourmTabs";
import {
  BookmarkIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  FlagIcon,
  PlusIcon,
  SettingsIcon,
} from "lucide-react";
import { useCourseStore } from "@/providers/courseStoreProvider";
import { useRouter } from "next/navigation";
import { TagsSidebar } from "../tags/TagsSidebar";
export default function PostsForumSidebar({
  selectedPost,
}: {
  selectedPost?: string;
}) {
  const posts = useCourseStore((state) => state.posts);
  const router = useRouter();
  const setPostDraft = useCourseStore((state) => state.setPostDraft);
  const course = useCourseStore((state) => state.course);
  const focusedPost = posts.find((post) => post.id === selectedPost)?.id;

  return (
    <>
      <MainSidebar className={false ? "hidden xl:block" : "flex flex-col"}>
        <div className="flex flex-row justify-center items-center w-full h-16 px-2">
          <Button
            size="lg"
            className="w-fit font-semibold px-4 min-h-none h-fit py-2"
            onClick={() => {
              setPostDraft({
                postArgs: {
                  course_id: course.id,
                  title: "",
                  content: "",
                },
                optionArgs: {
                  visibility: "public",
                  usePseudonym: false,
                },
              });

              router.push(`/forum/courses/${course.id}/forum`);
            }}
          >
            <PlusIcon className="min-h-5 min-w-5" />
            New Post
          </Button>
        </div>
        <TagsSidebar />
        <div className="flex flex-col text-primary-600 gap-2 p-2 px-3 justify-end font-semibold flex-1 items-stretch">
          <Button variant="ghost" className="w-full">
            <div className="flex flex-1 flex-row items-center gap-2">
              Drafts
            </div>
            <span className="text-xs text-neutral-500">0</span>
          </Button>
          <Button variant="ghost" className="w-full">
            <div className="flex flex-1 flex-row items-center gap-2">
              Saved Posts
              <BookmarkIcon className="min-h-3 min-w-3" />
            </div>
            <span className="text-xs text-neutral-500">0</span>
          </Button>
          <Button variant="ghost" className="w-full">
            <div className="flex flex-1 flex-row items-center gap-2">
              Flagged Posts
              <FlagIcon className="min-h-3 min-w-3" />
            </div>
            <span className="text-xs text-neutral-500">0</span>
          </Button>
          <Button variant="ghost" className="w-full">
            <div className="flex flex-1 flex-row items-center gap-2">
              Course Settings
            </div>
            <SettingsIcon className="min-h-3 min-w-3" />
          </Button>
          <Button variant="ghost" className="w-full">
            <div className="flex flex-1 flex-row items-center gap-2">
              Collapse Sidebar
            </div>
            <ChevronLeftIcon className="min-h-3 min-w-3" />
          </Button>
        </div>
      </MainSidebar>
      <MainListPanel className={false ? "hidden xl:block" : "b"}>
        <section
          className={cn(
            "flex bg-white relative flex-col h-full overflow-y-auto",
          )}
        >
          <div className="flex justify-center items-center h-14 shrink-0  py-2 pt-4 w-full gap-2">
            <div className="flex flex-row items-center px-4 gap-2 w-full">
              <span className="text-xs ">Sort by</span>
              <div className="flex flex-1 flex-row gap-2">
                <Button variant="ghost" className="font-semibold" size="sm">
                  Most Recent
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>

                <div className="flex flex-1 flex-shrink-0 items-center gap-2">
                  <div className="min-h-[1px] rounded-full w-full bg-neutral-400" />
                </div>

                <Button variant="ghost" className="font-semibold" size="sm">
                  All Posts
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <ul className="flex flex-col  gap-2 p-2">
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} isSelected={focusedPost === post.id} />
              </li>
            ))}
          </ul>
        </section>
      </MainListPanel>
    </>
  );
}
