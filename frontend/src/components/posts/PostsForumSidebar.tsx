"use client";
import { Fragment, useContext } from "react";
import { Post, AppendOperation } from "@/lib/types/posts";
import { cn, generateTempId, isPendingId } from "@/lib/utils";
import removeMarkdown from "markdown-to-text";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NewPost } from "@/components/posts/NewPost";
import { CopyIcon, DeleteIcon, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { courseContext } from "@/contexts/courseContext";
import { userContext } from "@/contexts/userContext";
import { getApiUrl } from "@/utils/helpers";

interface PostCardProps {
  post: Post;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: (post: Post) => void;
  setListOfPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}

const PostCard = ({
  post,
  isSelected,
  isEditing,
  onSelect,
  setListOfPosts,
}: PostCardProps) => {
  const user = useContext(userContext);
  const course = useContext(courseContext);
  const { toast } = useToast();
  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  async function handleDelete() {
    const confirmDelete = confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;
    const toDelete = post;
    setListOfPosts((prev) => prev.filter((p) => p.id !== post.id));
    const res = await fetch(
      `${getApiUrl()}/courses/${course.id as string}/posts/${post.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      },
    );

    fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courseId: course.id }),
    });

    if (!res.ok) {
      toast({
        title: "Failed to delete post",
      });
      setListOfPosts((prev) => [...prev, toDelete]);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(post)}
      className={cn(
        "text-left relative border transition-all duration-500 p-2 px-4 rounded-lg flex flex-col w-full",
        isSelected
          ? "bg-primary-50 border-primary-200 shadow-sm shadow-primary-200"
          : "border-neutral-200 bg-white",
        isPendingId(post.id) || isEditing
          ? "cursor-wait border-dashed border-neutral-200 bg-neutral-100"
          : "cursor-pointer",
      )}
    >
      <div className="flex items-center justify-between w-full gap-2 pb-2">
        <p className="text-sm font-semibold">{post.title}</p>
        <Popover>
          <PopoverContent
            side="right"
            align="start"
            alignOffset={-10}
            sideOffset={20}
            className=" bg-white border  w-fit p-0 border-neutral-200 rounded-lg shadow-sm"
          >
            <ul className="flex p-0 flex-col text-neutral-700 w-full   ">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(post.id);
                    toast({
                      title: "Copied ID",
                    });
                  }}
                  className=" flex gap-6 font-medium items-center border-b text-sm p-4 py-1 w-full hover:text-primary-500"
                >
                  <CopyIcon className="h-4 w-4 " />
                  <span>Copy ID</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-sm flex gap-6 font-medium items-center p-4 py-1 w-full hover:text-red-500"
                >
                  <DeleteIcon className="h-4 w-4 " />
                  <span>Delete</span>
                </button>
              </li>
            </ul>
          </PopoverContent>
          <PopoverTrigger asChild>
            <button
              type="button"
              onClick={handleMoreClick}
              className="focus:outline-none"
              disabled={isPendingId(post.id)}
            >
              <MoreHorizontal className="h-5 w-5 opacity-70" />
            </button>
          </PopoverTrigger>
        </Popover>
      </div>
      <section className="max-h-40 overflow-hidden">
        <p className="text-xs min-h-12 text-neutral-500">
          {isEditing
            ? "Editing..."
            : removeMarkdown(post.content.trim().slice(0, 200) + "...")}
        </p>
      </section>
    </div>
  );
};
interface PostsForumSidebarProps {
  posts: Post[];
  setSelectedPost: (post: Post) => void;
  selectedPost: Post | null;
  isEditing: string | null;
  setListOfPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}

export const PostsForumSidebar = ({
  posts,
  setSelectedPost,
  selectedPost,
  isEditing,
  setListOfPosts,
}: PostsForumSidebarProps) => {
  function appendToPosts({ operation, id, post }: AppendOperation) {
    if (operation === "optimistic") {
      const tempId = generateTempId();
      setListOfPosts((prev) => [
        { ...post, id: tempId, created_by: null },
        ...prev,
      ]);
      return tempId;
    } else {
      setListOfPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, id: post.id } : p)),
      );
    }
  }

  return (
    <Fragment>
      <section className="flex relative flex-col h-full overflow-y-auto min-w-[500px] max-w-[500px]">
        <div className="flex justify-center h-12 flex-shrink-0 border-b w-full gap-2" />
        <ul className="flex flex-col gap-2 p-2">
          {posts.map((post) => (
            <li key={post.id}>
              <PostCard
                post={post}
                isSelected={selectedPost?.id === post.id}
                isEditing={isEditing === post.id}
                onSelect={setSelectedPost}
                setListOfPosts={setListOfPosts}
              />
            </li>
          ))}
        </ul>
      </section>
      <NewPost appendToPosts={appendToPosts} />
    </Fragment>
  );
};
