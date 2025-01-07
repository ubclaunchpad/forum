import { Post } from "@/lib/types/posts";
import { Suspense, useEffect, useState } from "react";
import EditorComponent from "../general/EditorComponent";

export default function PostView({ post }: { post: Post }) {
  const [content, setContent] = useState(post.content);

  useEffect(() => {
    setContent(post.content);
  }, [post.content]);

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-white  ">
      <Suspense fallback={null}>
        <div className="flex flex-col  flex-1 w-full  gap-4 items-center border-t-neutral-200">
          <h5 className="font-semibold  w-full border-b p-2 flex items-center ">
            {post.title}
          </h5>
          <div className="flex max-w-[900px] w-full flex-col gap-2">
            <EditorComponent
              markdown={content}
              onMarkdownChange={setContent}
              editable={true}
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
