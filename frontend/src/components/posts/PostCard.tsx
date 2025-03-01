"use client";
import { useContext } from "react";
import { Post, PostType, PostWithRequiredId } from "@/lib/types/posts";
import {
  cn,
  getIdType,
  getRelativeTimeString,
  isIDTemporary,
  isPendingId,
} from "@/lib/utils";
import removeMarkdown from "markdown-to-text";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DeleteIcon, LinkIcon, MoreHorizontal, ThumbsUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userContext } from "@/contexts/userContext";
import { getApiUrl } from "@/utils/helpers";
import { forumPostsContext } from "@/contexts/PostsContext";
import { useCourseStore } from "@/providers/courseStoreProvider";

type PostCardProps<T extends PostType> = {
  post: T extends "draft" ? PostWithRequiredId : Post;
  isSelected: boolean;
};

export const PostCard = <T extends PostType>({
  post,
  isSelected,
}: PostCardProps<T>) => {
  const { setListOfPosts, setSelectedPost, isEditing } =
    useContext(forumPostsContext);

  const user = useContext(userContext);
  const course = useCourseStore((state) => state.course);
  const { toast } = useToast();
  const postType = getIdType(post.id);
  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  async function handleDelete() {
    if (isIDTemporary(post.id)) {
      return;
    }

    const confirmDelete = confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;
    const toDelete = post;
    setListOfPosts((prev) => prev.filter((p) => p.id !== post.id));
    if (isSelected) {
      setSelectedPost(null);
    }
    const res = await fetch(
      `${getApiUrl()}/courses/${course.id as string}/posts/${post.local_id}`,
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
      setListOfPosts((prev) => [...prev, toDelete as Post]);
    }
  }

  async function updateUserEvent(post: Post, eventType: "view" | "like") {
    const response = await fetch(
      `${getApiUrl()}/courses/${course.id as string}/posts/${post.local_id}/events/${eventType}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      }
    );
    fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courseId: course.id }),
    });

    if (!response.ok) {
      throw new Error(`Failed to mark post as ${eventType}`);
    }
  }

  const handleLikeClick = async (post: Post) => {
    // Optimistically update the like count
    const updatedPost = {
      ...post,
      user_interactions: {
        ...post.user_interactions,
        liked: true,
      },
      stats: {
        ...post.stats,
        likes: post.stats?.likes ? post.stats.likes + 1 : 0,
      },
    };
    setSelectedPost(updatedPost); // Update the selected post in state
  
    try {
      // Make the like API call
      await updateUserEvent(post, "like");
  
      // Optionally handle success actions after the like request is complete
    } catch (error) {
      // In case of failure, revert the optimistic update
      const revertedPost = { ...post, likes_count: (post.stats?.likes || 0) - 1 };
      setSelectedPost(revertedPost);
    }
  };

  const handleView = async (post: Post | PostWithRequiredId) => {
    // Optimistically update the like count
    const updatedPost = {
      ...post,
      user_interactions: {
        ...post.user_interactions,
        viewed: true,
      },
      stats: {
        ...post.stats,
        views: post.stats?.views + 1,
      },
    };
    setSelectedPost(updatedPost); // Update the selected post in state
  
    try {
      // Make the like API call
      await updateUserEvent(post, "view");
  
      // Optionally handle success actions after the like request is complete
    } catch (error) {
      // In case of failure, revert the optimistic update
      const revertedPost = { ...post, likes_count: (post.stats?.views || 0) - 1 };
      setSelectedPost(revertedPost);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        const container = e.currentTarget.closest('[class*="overflow-y-auto"]');
        if (container instanceof HTMLElement) {
          sessionStorage.setItem("forumlist", container.scrollTop.toString());
        }
        handleView(post);
        setSelectedPost(post);
      }}
      className={cn(
        "text-left relative border transition-all duration-500   rounded-lg flex flex-col w-full",
        isSelected
          ? "bg-primary-50 border-primary-200 shadow-sm shadow-primary-200"
          : "border-neutral-200 bg-white",
        isPendingId(post.id) || isEditing === post.id
          ? "cursor-wait border-dashed border-neutral-200 bg-neutral-100"
          : "cursor-pointer",
      )}
    >
      <div className="flex items-center justify-between p-2 px-4 w-full gap-2 pb-2">
        <p className="text-sm font-semibold">
          {postType === "local" && (
            <span className="border text-xs rounded-md text-neutral-600 dashed p-1 uppercase">
              Draft
            </span>
          )}
          {post.title}
        </p>

        <h2 className=" font-medium text-xs flex-shrink-0 ">
          {post.applied_at &&
            getRelativeTimeString(
              new Date(post.applied_at).getTime(),
              "en",
              30,
            )}
        </h2>
      </div>
      <section className="max-h-40 overflow-hidden px-4">
        <p className="text-xs py-2  text-wrap text-neutral-500 select-none line-clamp-4 break-words">
          {isEditing === post.id
            ? "Editing..."
            : removeMarkdown((post.content ?? "").trim().slice(0, 200) + "...")}
        </p>
      </section>

      {!isIDTemporary(post.id) && (
        <div
          className={cn(
            "flex-row w-full flex px-4 h-10 border-t  items-center  gap-1",
            isSelected ? "border-t-primary-100" : "border-t-neutral-100",
          )}
        >
          {/* Add "Not Viewed" dot here before the MoreHorizontal button */}
          {!post.user_interactions?.viewed && (
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-600 inline-block"></span>
              <span className="text-xs text-neutral-700">Not Viewed</span>
            </span>
          )}
          <div className="flex flex-1 " />

          {/* Display likes, and allow user to like post */}
          <div className="flex items-center gap-2">
          {post.user_interactions?.liked ? (
            <ThumbsUp
              className="h-5 w-5 text-primary-600 cursor-pointer"
              onClick={() => handleLikeClick(post)} // Handle like click
            />
          ) : (
            <ThumbsUp
              className="h-5 w-5 text-neutral-600 cursor-pointer"
            />
          )}
          <span className="text-xs text-neutral-700">{post.stats?.likes || 0}</span>
          </div>

          <Popover>
            <PopoverContent
              side="right"
              align="start"
              alignOffset={-10}
              sideOffset={20}
              className=" bg-white border  w-fit p-0 border-neutral-200 rounded-lg shadow-sm"
            >
              <ul className="flex p-0 flex-col text-neutral-700 w-full ">
                {post.id && !isPendingId(post.id) && (
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/forum/courses/${course.id}/forum/${post.local_id}`,
                        );
                        toast({
                          title: "Copied link to post",
                        });
                      }}
                      className=" flex gap-6 font-medium items-center border-b text-sm p-4 py-1 w-full "
                    >
                      <LinkIcon className="h-4 w-4 " />
                      <span>Copy link to post</span>
                    </button>
                  </li>
                )}
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
              >
                <MoreHorizontal className="h-5 w-5 opacity-70" />
              </button>
            </PopoverTrigger>
          </Popover>
        </div>
      )}
    </div>
  );
};
