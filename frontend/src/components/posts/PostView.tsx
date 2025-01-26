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
import {
  ArrowRightFromLine,
  BookmarkIcon,
  DotIcon,
  Maximize2Icon,
  MessageSquareReplyIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { getRelativeTimeString } from "@/lib/utils";

const rtf = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

export default function PostView({
  post,
  setListOfPosts,
  isEditing,
  setIsEditing,
  setSelectedPost,
}: {
  post: Post;
  setListOfPosts: Dispatch<SetStateAction<Post[]>>;
  isEditing: string | null;
  setIsEditing: Dispatch<SetStateAction<string | null>>;
  setSelectedPost: (post: Post | null) => void;
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
    <div className="flex-1 relative flex flex-col overflow-auto p-4 pt-0 ">
      <div className=" w-full h-12   flex-shrink-0 px-2 flex items-center  gap-2">
        <div className="flex  item-center gap-6 flex-1 text-primary-700 ">
          <Button
            className="p-0"
            variant="ghost"
            size="sm"
            onClick={() => setSelectedPost(null)}
          >
            <ArrowRightFromLine className="min-w-5 min-h-5 " />
          </Button>
          {/* <Button className="p-0" variant="ghost" size="sm">
            <Maximize2Icon className="min-w-5 min-h-5" />
          
            </Button> */}
        </div>
        <div className="flex justify-end item-center gap-0.5 text-neutral-700 flex-1">
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
        </div>
      </div>

      {isSaving && <div className="  shimmer-reverse"></div>}
      <Suspense fallback={null}>
        <div className="flex flex-col bg-white rounded-xl border border-primary-100 h-fit  w-full py-4  gap-4 items-center ">
          <div className=" w-full pt-4  p-2 justify-center flex items-center ">
            <div className="flex-1 w-full flex items-center max-w-4xl gap-2">
              <h2 className=" font-semibold text-lg text-primary-600 ">
                {post.title}
              </h2>
              {/* <Button className="p-0" variant="ghost" size="sm">
            <FileScanIcon className="w-5 h-5" />
            </Button> */}
            </div>
            {/* <div className="flex-1 flex justify-end gap-2">
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
            </div> */}
          </div>
          <div className="flex max-w-4xl   w-full flex-col gap-2">
            <EditorComponent
              markdown={content}
              onMarkdownChange={setContent}
              editable={isEditing === post.id}
            />
          </div>

          {/* <div className="flex-1 w-full flex items-center max-w-4xl gap-2">
            <div className="flex item-center gap-4 flex-1">
              <h2 className=" font-semibold text-sm ">28 replies</h2>
              <h2 className=" font-semibold text-sm ">1 instructor comment</h2>
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
          </div> */}
        </div>
      </Suspense>
      <div className="flex flex-col font-medium gap-4 p-4">
        <div className="flex flex-col gap-2">
          <h4>Comments</h4>
        </div>
      </div>
    </div>
  );
}
