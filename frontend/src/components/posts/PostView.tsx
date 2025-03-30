"use client";

import { Suspense, useContext, useState } from "react";
import {
  CheckIcon,
  DotIcon,
  ThumbsUpIcon,
  ReplyIcon,
  MoreHorizontalIcon,
  XIcon,
  BookMarkedIcon,
  BookmarkIcon,
} from "lucide-react";
import { getRelativeTimeString } from "@/lib/utils";
import { useCourseStore } from "@/providers/courseStoreProvider";
import { PostWithComments } from "@forum/shared";
import {
  PostTitleSection,
  PostTextBoxSection,
  PostViewWrapper,
  PostViewHeaderWrapper,
  PostContentWrapper,
  PostPopoverOptions,
  PostContentWrapperFooter,
  PostCommentsSection,
  PostActionRow,
} from "./post-editor-sections";
import { Button } from "../ui/button";
import { getApiUrl } from "@/utils/helpers";
import { userContext } from "@/providers/userContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function PostView({ post }: { post: PostWithComments }) {
  const course = useCourseStore((state) => state.course);
  const [isEditing, setIsEditing] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const { token } = useContext(userContext);
  const router = useRouter();

  async function handleSave() {
    const res = await fetch(`${getApiUrl()}/posts/${post.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        post: {
          title,
          content,
          course_id: course.id,
        },
        options: {},
      }),
    });

    if (res.ok) {
      toast.success("Post updated successfully");
      setIsEditing(false);
    } else {
      toast.error("Failed to update post");
    }
  }

  async function handleDelete() {
    const res = await fetch(`${getApiUrl()}/posts/${post.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      toast.success("Post deleted successfully");
      router.push(`/forum/courses/${course.id}/forum`);
    } else {
      toast.error("Failed to delete post");
    }
  }

  return (
    <PostViewWrapper>
      <PostViewHeaderWrapper
        options={{
          canNavigateBack: true,
          navigateBackUrl: `/forum/courses/${course.id}/forum`,
        }}
      >
        <div className="flex justify-end item-center gap-0.5 text-neutral-700 flex-1">
          <h2 className=" font-medium text-sm ">
            Post #{post.number_id} by{" "}
            {post.authors?.map((author) => author.pseudonym).join(", ")}
          </h2>
          <span>
            <DotIcon className="opacity-50 min-w-5 min-h-5 " />
          </span>
          <h2 className=" font-medium text-sm ">
            {post.updated_at &&
              getRelativeTimeString(
                new Date(post.updated_at).getTime(),
                "en",
                30,
              )}
          </h2>
        </div>
      </PostViewHeaderWrapper>

      <Suspense fallback={null}>
        <PostContentWrapper options={{ isEditing: isEditing }}>
          <PostTitleSection
            title={title}
            setTitle={setTitle}
            options={{ placeholder: "Post Title", isEditing: isEditing }}
          >
            <PostPopoverOptions
              post={post}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              actions={{
                handleSave,
                handleDelete,
              }}
            />
          </PostTitleSection>
          <PostTextBoxSection
            content={content}
            setContent={setContent}
            options={{ isEditing: isEditing }}
          />
          {!isEditing && (
            <PostActionRow>
              <div className="flex flex-row w-full">
                <div className="flex flex-row flex-1 justify-end text-primary-700 font-semibold stroke-2 gap-8 px-4 w-full">
                  <button className="flex flex-row items-center gap-1">
                    <ThumbsUpIcon className="max-w-5 max-h-5" />
                  </button>
                  <button
                    className="flex flex-row items-center gap-1"
                    onClick={() => setIsCommenting(!isCommenting)}
                  >
                    <ReplyIcon className="max-w-5 max-h-5" />
                  </button>
                  <button className="flex flex-row items-center gap-1">
                    <BookmarkIcon className="max-w-5 max-h-5" />
                  </button>
                </div>
              </div>
            </PostActionRow>
          )}
        </PostContentWrapper>
        <PostNewCommentSection
          postId={post.id}
          isCommenting={isCommenting}
          setIsCommenting={setIsCommenting}
        />

        {!isEditing && <PostCommentsSection comments={post.comments} />}
        <PostContentWrapperFooter options={{ show: isEditing }}>
          <div className="flex gap-2 justify-end w-full">
            <Button
              variant="outline"
              className="border-primary-muted cursor-pointer"
              size="lg"
              onClick={() => {
                setTitle(post.title ?? "");
                setContent(post.content ?? "");
                setIsEditing(false);
              }}
            >
              <XIcon />
              Cancel
            </Button>
            <Button
              className="px-4 cursor-pointer "
              variant={`${isEditing ? "default" : "ghost"}`}
              onClick={handleSave}
              disabled={
                (content === post.content && title === post.title) ||
                content.length <= 2 ||
                title.length <= 2
              }
              size="lg"
            >
              <CheckIcon />
              Save
            </Button>
          </div>
        </PostContentWrapperFooter>
      </Suspense>
    </PostViewWrapper>
  );
}

export function PostMutatationEditor() {
  const postDraft = useCourseStore((state) => state.postDraft);
  const setPostDraft = useCourseStore((state) => state.setPostDraft);
  const router = useRouter();
  const course = useCourseStore((state) => state.course);
  if (!postDraft) {
    return null;
  }

  const { token } = useContext(userContext);
  async function handleCreatePost() {
    if (!postDraft) {
      return;
    }
    const res = await fetch(`${getApiUrl()}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        post: postDraft.postArgs,
        options: postDraft.optionArgs,
      }),
    });

    if (res.ok) {
      const newPost = await res.json();
      setPostDraft(null);
      router.prefetch(`/forum/courses/${course.id}/forum/${newPost.id}`);
      toast.success("Post created successfully");
      router.push(`/forum/courses/${course.id}/forum/${newPost.id}`);
    } else {
      toast.error("Failed to create post");
    }
  }

  return (
    <PostViewWrapper>
      <PostViewHeaderWrapper
        options={{
          canNavigateBack: false,
          navigateBackUrl: "",
          onNavigateBack: () => setPostDraft(null),
        }}
      >
        <div className="flex justify-end items-center 2 w-full gap-2">
          <h2 className=" font-medium text-sm ">Draft</h2>
        </div>
      </PostViewHeaderWrapper>
      <PostContentWrapper options={{ isEditing: true }}>
        <PostTitleSection
          title={postDraft.postArgs.title ?? ""}
          setTitle={(title) =>
            setPostDraft({
              ...postDraft,
              postArgs: { ...postDraft.postArgs, title },
            })
          }
          options={{ placeholder: "Post Title", isEditing: true }}
        />
        <PostTextBoxSection
          content={postDraft.postArgs.content ?? ""}
          setContent={(content) =>
            setPostDraft({
              ...postDraft,
              postArgs: { ...postDraft.postArgs, content },
            })
          }
          options={{ editable: true, isEditing: true }}
        />
      </PostContentWrapper>
      <PostContentWrapperFooter options={{ show: true }}>
        <div className="flex gap-2 justify-end w-full">
          <Button
            variant="outline"
            className="border-primary-muted cursor-pointer"
            size="lg"
            onClick={() => setPostDraft(null)}
          >
            <XIcon />
            Discard
          </Button>
          <Button
            variant="default"
            className="cursor-pointer"
            size="lg"
            onClick={handleCreatePost}
          >
            <CheckIcon />
            Create Post
          </Button>
        </div>
      </PostContentWrapperFooter>
    </PostViewWrapper>
  );
}

function PostNewCommentSection({
  isCommenting,
  setIsCommenting,
  postId,
}: {
  isCommenting: boolean;
  setIsCommenting: (isCommenting: boolean) => void;
  postId: string;
}) {
  const [commentContent, setCommentContent] = useState("");
  const { token } = useContext(userContext);

  if (!isCommenting) {
    return null;
  }

  async function handlePostComment() {
    toast.info("Working on it...");
    // const res = await fetch(`${getApiUrl()}/posts/${postId}/comments`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${token}`,
    //   },
    //   body: JSON.stringify({
    //     comment: {
    //       content: commentContent,
    //     },
    //   }),
    // });

    // if (res.ok) {
    //   toast.success("Comment posted successfully");
    //   setIsCommenting(false);
    // } else {
    //   toast.error("Failed to post comment");
    // }
  }
  return (
    <div className="flex flex-col px-4 py-8 gap-2">
      <PostContentWrapper options={{ isEditing: isCommenting }}>
        <PostTextBoxSection
          content={commentContent}
          setContent={setCommentContent}
          options={{ isEditing: isCommenting, editorClass: "text-sm min-h-40" }}
        />
        <PostContentWrapperFooter options={{ show: true }}>
          <div className="flex gap-2 justify-end w-full">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsCommenting(false)}
            >
              <XIcon />
              Cancel
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={handlePostComment}
              disabled={commentContent.length <= 2}
            >
              <CheckIcon />
              Post Comment
            </Button>
          </div>
        </PostContentWrapperFooter>
      </PostContentWrapper>
    </div>
  );
}
