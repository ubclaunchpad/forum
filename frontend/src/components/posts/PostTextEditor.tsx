"use client";

import { Post, PostWithRequiredId } from "@/lib/types/posts";
import { useContext } from "react";
import EditorComponent from "../general/EditorComponent";
import { Button } from "../ui/button";
import { cn, isIDTemporary } from "@/lib/utils";
import { forumPostsContext } from "@/contexts/PostsContext";
import { CheckIcon, PencilIcon, XIcon } from "lucide-react";

type PostTextEditorProps = {
  post: Post | PostWithRequiredId;
  title: string;
  content: string;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  handleSave: () => Promise<void>;
};

// Then your component would be typed like:
export default function PostTextEditor({
  post,
  title,
  content,
  setTitle,
  setContent,
  handleSave,
}: PostTextEditorProps) {
  const { isEditing, setIsEditing } = useContext(forumPostsContext);
  const isTemporary = isIDTemporary(post?.id);

  if (!post || post === null) {
    return <></>;
  }

  async function handleClick() {
    if (isEditing) {
      await handleSave();
    }
    setIsEditing(isEditing ? null : post.id);
  }

  return (
    <div className="flex flex-col relative min-h-[max(450px,40vh)] bg-white rounded-xl border border-primary-50 h-fit  w-full pb-4  gap-4 items-center ">
      <div className=" w-full pt-2  justify-center flex items-center ">
        <div className="flex-col w-full flex px-4 items-center  gap-1">
          <div className="flex-1 w-full   top-0 right-0 m-2 flex justify-end gap-2">
            {isEditing ? (
              <Button
                variant="ghost"
                className="px-2 hover:text-neutral-700"
                size="sm"
                onClick={() => {
                    setTitle(post.title??"")
                    setContent(post.content??"")
                    setIsEditing(null)
                }}
              >
                <XIcon/>
                Cancel
              </Button>
            ) : (
              <Button
                className="px-2"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(post.id)}
              >
                <PencilIcon/>
                Edit
              </Button>
            )}

            {isEditing && (
              <Button
              className="px-4 "
                variant={`${isEditing ? "solid" : "ghost"}`}
                onClick={handleClick}
                disabled={(content === post.content && title === post.title) || (content.length <= 2 || title.length <= 2)}
                size="sm"
              >
                <CheckIcon/>
                {isTemporary ? "Publish Post" : "Update Post"}
              </Button>
            )}
          </div>
          <input
            className={cn(
              "w-full p-2 max-w-4xl disabled:bg-transparent rounded-lg outline-none font-semibold text-lg text-primary-600 ",
              isEditing ? "bg-neutral-50" : "",
            )}
            placeholder="Post Title"
            value={title}
            disabled={isEditing !== post.id}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>
      <div className="flex max-w-4xl flex-1 p-2 px-6  w-full flex-col gap-2">
        <EditorComponent
        
          markdown={content ?? ""}
          onMarkdownChange={setContent}
          editable={isEditing === post.id}
        />
      </div>

      {/* {!isTemporary && (
            <div className=" w-full flex items-center max-w-4xl gap-2">
              <div className="flex item-center gap-4 flex-1">
                <h2 className=" font-semibold text-sm ">28 replies</h2>
                <h2 className=" font-semibold text-sm ">
                  1 instructor comment
                </h2>
              </div>

              <div className="flex item-center gap-6 text-primary-700 ">
                <Button className="p-0" variant="ghost" size="sm">
                  <ThumbsUpIcon className="min-w-5 min-h-5 " />2
                </Button>
                <Button className="p-0" variant="ghost" size="sm">
                  <MessageSquareReplyIcon className="min-w-5 min-h-5" />
                </Button>

                <Button className="p-0" variant="ghost" size="sm">
                  <BookmarkIcon className="min-w-5 min-h-5" />
                </Button>
              </div>
            </div>
          )} */}
    </div>
  );
}
