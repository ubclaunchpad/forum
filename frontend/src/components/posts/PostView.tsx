import { Post } from "@/lib/types/posts";
import {
  Dispatch,
  SetStateAction,
  Suspense,
  useContext,
  useEffect,
  useState,
} from "react";
import EditorComponent from "../general/EditorComponent";
import { Button } from "../ui/button";
import { getApiUrl } from "@/utils/helpers";
import { courseContext } from "@/contexts/courseContext";
import { useToast } from "@/hooks/use-toast";
import { userContext } from "@/contexts/userContext";

export default function PostView({
  post,
  setListOfPosts,
  isEditing,
  setIsEditing,
}: {
  post: Post;
  setListOfPosts: Dispatch<SetStateAction<Post[]>>;
  isEditing: string | null;
  setIsEditing: Dispatch<SetStateAction<string | null>>;
}) {
  const [content, setContent] = useState(post.content);
  const oldContent = post.content;
  const course = useContext(courseContext);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const user = useContext(userContext);

  async function handleSave() {
    setIsSaving(true);
    const requestData = {
      post_id: post.id,
      new_content: content,
      edit_reason: "Post edited",
    };
    setListOfPosts((prev) => {
      return prev.map((p) => {
        if (p.id === post.id) {
          return { ...p, content: content };
        }
        return p;
      });
    });
    const res = await fetch(
      `${getApiUrl()}/courses/${course.id as string}/posts/${post.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(requestData),
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
            return { ...p, content: oldContent };
          }
          return p;
        });
      });
      console.log("Error");
    }
    setIsSaving(false);
  }

  async function handleClick() {
    if (isEditing) {
      await handleSave();
    } else {
      console.log("Edit");
    }
    setIsEditing(isEditing ? null : post.id);
  }

  useEffect(() => {
    setContent(post.content);
  }, [post.content]);

  return (
    <div className="flex-1 relative flex flex-col overflow-auto bg-white  ">
      {isSaving && <div className="  shimmer-reverse"></div>}
      <Suspense fallback={null}>
        <div className="flex flex-col  flex-1 w-full  gap-4 items-center border-t-neutral-200">
          <div className=" w-full border-b  h-12 p-2 flex items-center ">
            <div className="flex-1 flex items-center gap-2">
              <h5 className=" font-semibold text-sm  ">{post.title}</h5>
              {/* <Button className="p-0" variant="ghost" size="sm">
            <FileScanIcon className="w-5 h-5" />
            </Button> */}
            </div>
            <div className="flex-1 flex justify-end gap-2">
              {isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(null)}
                >
                  Cancel
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(post.id)}
                >
                  Edit
                </Button>
              )}

              {isEditing && (
                <Button
                  variant={`${isEditing ? "solid" : "outline"}`}
                  onClick={handleClick}
                  disabled={isSaving || content === oldContent}
                  size="sm"
                >
                  Save
                </Button>
              )}
            </div>
          </div>
          <div className="flex max-w-[900px] w-full flex-col gap-2">
            <EditorComponent
              markdown={content}
              onMarkdownChange={setContent}
              editable={isEditing === post.id}
            />
          </div>
        </div>
      </Suspense>
      {/* <div className="flex flex-col gap-4 p-4 border-t border-t-neutral-200">
        <div className="flex flex-col gap-2">
          <h4>Comments</h4>
        </div>
      </div> */}
    </div>
  );
}
