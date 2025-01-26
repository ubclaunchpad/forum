"use client";

import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Fragment, useContext, useState } from "react";
import { Input } from "../ui/input";
import Editor from "@/components/general/EditorComponent";
import { getApiUrl } from "@/utils/helpers";
import { useToast } from "@/hooks/use-toast";
import { courseContext } from "@/contexts/courseContext";
import { AppendOperation } from "@/lib/types/posts";
import { userContext } from "@/contexts/userContext";

async function createPost(
  {
    title,
    content,
    courseId,
  }: {
    title: string;
    content: string;
    courseId: string;
  },
  token: string,
) {
  const res = await fetch(`${getApiUrl()}/courses/${courseId}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content, parentId: null }),
  });

  if (res.ok) {
    fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courseId }),
    });
    return res.json();
  }
  throw new Error("Failed to create post");
}

export const NewPost = ({
  appendToPosts,
}: {
  appendToPosts: (args: AppendOperation) => string | undefined;
}) => {
  const user = useContext(userContext);
  const { toast } = useToast();
  const course = useContext(courseContext);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const openModal = () => {
    const el = document.getElementById("new-post") as
      | HTMLDialogElement
      | null
      | undefined;
    el?.showModal();
  };

  const closeModal = () => {
    setTitle("");
    setContent("");
    const el = document.getElementById("new-post") as
      | HTMLDialogElement
      | null
      | undefined;
    el?.close();
  };

  return (
    <Fragment>
      <Button
        className="flex items-center gap-2  h-fit w-fit  p-2 absolute right-4 bottom-4 shadow-lg"
        onClick={() => openModal()}
      >
        <PlusIcon className="min-w-10 min-h-10" />
      </Button>
      <dialog
        className="min-w-[500px] max-w-full w-[1000px]  min-h-[500px] max-h-[90dvh] h-full border shadow-sm rounded-xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white"
        id="new-post"
      >
        <div className="flex flex-col flex-1  h-full overflow-hidden ">
          <div className="flex justify-between items-center bg-neutral-50 p-4 py-2 border-b">
            <button
              onClick={() => closeModal()}
              className="p-2 rounded-full hover:bg-neutral-100"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          <form className="flex flex-col min-w-[700px] gap-4 overflow-auto flex-1">
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className="p-2 text-md border-t-0 border-x-0 border-neutral-200 bg-inherit border-b  rounded-none py-6"
            />

            <Editor
              markdown={content}
              onMarkdownChange={setContent}
              className="overflow-auto h-full min-h-1"
              editable={true}
            />
          </form>
          <div className="flex justify-end p-4 min-h-10 border-t items-center flex-shrink-0">
            <Button
              size={"sm"}
              disabled={!title || !content}
              className="self-end"
              onClick={() => {
                const tempId = appendToPosts({
                  operation: "optimistic",
                  id: null,
                  post: { title, content },
                });
                if (!tempId) {
                  throw new Error("Failed to create post");
                }
                closeModal();
                createPost(
                  {
                    title,
                    content,
                    courseId: course.id,
                  },
                  user.token,
                )
                  .then((res) => {
                    appendToPosts({
                      operation: "real",
                      id: tempId,
                      post: res,
                    });

                    toast({
                      title: "Post created",
                    });
                  })
                  .catch(() => {
                    toast({
                      title: "Failed to create post",
                      description: "Please try again",
                    });
                  });
              }}
            >
              Create Post
            </Button>
          </div>
        </div>
      </dialog>
    </Fragment>
  );
};
