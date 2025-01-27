import { Post, PostType, PostWithRequiredId } from "@/lib/types/posts";
import { Suspense, useContext, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { getApiUrl } from "@/utils/helpers";
import { courseContext } from "@/contexts/courseContext";
import { useToast } from "@/hooks/use-toast";
import { userContext } from "@/contexts/userContext";
import { ArrowRightFromLine, DotIcon } from "lucide-react";
import { getRelativeTimeString, isIDTemporary } from "@/lib/utils";
import { forumPostsContext } from "@/contexts/PostsContext";
import PostTextEditor from "./PostTextEditor";

export default function PostView<T extends PostType>({
  post,
}: {
  post: T extends "draft" ? PostWithRequiredId : Post;
}) {
  const {
    setListOfPosts,
    selectedPost,
    setDrafts: setListOfDrafts,
    setSelectedPost,
    isEditing,
    setIsEditing,
  } = useContext(forumPostsContext);

  const course = useContext(courseContext);
  const user = useContext(userContext);

  const oldContent = post?.content;

  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");

  const isTemporary = isIDTemporary(post?.id);

  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  async function handleSaveAction() {
    if (isIDTemporary(post.id)) {
      await handlePublish();
    } else {
      await handleSave();
    }
  }

  async function handlePublish() {
    setIsSaving(true);
    const requestData = {
      title: title,
      content: content,
    };

    try {
      const res = await fetch(
        `${getApiUrl()}/courses/${course.id as string}/posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(requestData),
        },
      );

      if (res.ok) {
        const newPost = await res.json();

        // Remove from drafts
        setListOfDrafts((prev) => prev.filter((p) => p.id !== post.id));

        // Add to list of posts
        setListOfPosts((prev) => [newPost, ...prev]);

        // Update selected post to the new published version
        setSelectedPost(newPost);

        // Clear editing state
        setIsEditing(null);

        // Revalidate
        await fetch("/api/revalidate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ courseId: course.id }),
        });

        toast({
          title: "Success",
          description: "Post published successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to publish post",
        });
      }
    } catch (error) {
      console.error("Error publishing post:", error);
      toast({
        title: "Error",
        description: "Failed to publish post",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    const requestData = {
      post_id: post.id,
      title: title,
      new_content: content,
      edit_reason: "Post edited",
    };

    if (isTemporary) {
      setIsSaving(false);
      setListOfDrafts((prev) => {
        return prev.map((p) => {
          if (p.id === post.id) {
            return { ...p, content: content };
          }
          return p;
        });
      });

      return;
    } else {
      setListOfPosts((prev) => {
        return prev.map((p) => {
          if (p.id === post.id) {
            return { ...p, content: content } as Post;
          }
          return p;
        });
      });
    }
    const res = await fetch(
      `${getApiUrl()}/courses/${course.id as string}/posts/${post.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          ...requestData,
          post_id: parseInt(requestData.post_id),
        }),
      },
    );
    if (res.ok) {
      if (res.ok) {
        fetch("/api/revalidate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ courseId: course.id }),
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to save post",
      });
      setListOfPosts((prev) => {
        return prev.map((p) => {
          if (p.id === post.id) {
            return { ...p, content: oldContent } as Post;
          }
          return p;
        });
      });
      console.log("Error");
    }
    setIsSaving(false);
  }

  useEffect(() => {
    setContent(post.content ?? "");
    setTitle(post.title ?? "");
  }, [post]);

  return (
    <div
      className={`flex justify-center flex-1 lg:border-l  flex-shrink-0 w-full transition-all duration-300 ${selectedPost ? "border-neutral-200" : "border-neutral-200"}`}
    >
      <div className="flex-1 relative flex flex-col overflow-auto p-4 pt-0 ">
        <div className=" w-full h-16   flex-shrink-0 px-2 flex items-center  gap-2">
          <div className="flex  item-center gap-6 flex-1 text-primary-700 ">
            <Button
              className="p-0"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPost(null)}
            >
              <ArrowRightFromLine className="min-w-5 min-h-5 " />
            </Button>
          </div>
          <div className="flex justify-end item-center gap-0.5 text-neutral-700 flex-1">
            {isTemporary ? (
              <></>
            ) : (
              <>
                <h2 className=" font-medium text-sm ">Post #{post.id}</h2>
                <span>
                  <DotIcon className="opacity-50 min-w-5 min-h-5 " />
                </span>
                <h2 className=" font-medium text-sm ">
                  {post.applied_at &&
                    getRelativeTimeString(
                      new Date(post.applied_at).getTime(),
                      "en",
                      30,
                    )}
                </h2>
              </>
            )}
          </div>
        </div>

        {isSaving && <div className="shimmer-reverse"></div>}
        <Suspense fallback={null}>
          <PostTextEditor
            post={post}
            title={title}
            content={content}
            setTitle={setTitle}
            setContent={setContent}
            handleSave={handleSaveAction}
          />
        </Suspense>
        {!isTemporary && (
          <div className="flex flex-col font-semibold gap-4 p-4">
            <div className="flex flex-col gap-2">
              <h4>Comments</h4>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
