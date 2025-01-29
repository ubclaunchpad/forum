"use client";

import { Post, PostWithRequiredId } from "@/lib/types/posts";
import { getIdType } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { courseContext } from "./courseContext";

type ForumContextType = {
  selectedPost: Post | null;
  listofPosts: Post[];
  isEditing: string | null;
  drafts: PostWithRequiredId[];
  setSelectedPost: (post: PostWithRequiredId | null) => void;
  setListOfPosts: Dispatch<SetStateAction<Post[]>>;
  setIsEditing: (id: string | null) => void;
  setDrafts: Dispatch<SetStateAction<PostWithRequiredId[]>>;
  edittingSelectPost: (post: Post) => void;
};

export const forumPostsContext = createContext({} as ForumContextType);

export function ForumContextProvider({
  children,
  initialPosts,
  initialSelectedId,
}: {
  children: React.ReactNode;
  initialPosts: Post[];
  initialSelectedId?: string;
}) {
  const course = useContext(courseContext);
  const router = useRouter();
  const foundPost = initialSelectedId
    ? initialPosts.find(
        (post) => post.local_id.toString() === initialSelectedId,
      )
    : null;

  const [selectedPost, setSelectedPost] = useState<Post | null>(
    foundPost || null,
  );
  const [listofPosts, setListOfPosts] = useState<Post[]>(initialPosts);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<PostWithRequiredId[]>([]);

  //   function appendToPosts({ operation, id, post }: AppendOperation) {
  //     if (operation === "optimistic") {
  //       const tempId = generateTempId();
  //       setListOfPosts((prev) => [
  //         { ...post, id: tempId, created_by: null },
  //         ...prev,
  //       ]);
  //       return tempId;
  //     } else {
  //       setListOfPosts((prev) =>
  //         prev.map((p) => (p.id === id ? { ...p, id: post.id } : p)),
  //       );
  //     }
  //   }

  function edittingSelectPost(post: Post): void {
    if (isEditing !== post.id) {
      setIsEditing(null);
    }
    console.log(post);
    setPostAndRoute(post);
  }

  function setPostAndRoute(post: PostWithRequiredId | null): void {
    if (!post) {
      setSelectedPost(null);
      router.push(`/forum/courses/${course.id}/forum`);
      return;
    }

    if (
      isEditing &&
      isEditing !== post.id &&
      ["local"].includes(getIdType(isEditing))
    ) {
      setDrafts((prevDrafts) =>
        prevDrafts.filter((draft) => draft.id !== isEditing),
      );
      setSelectedPost(null);
      setIsEditing(null);
      return;
      // }
    }

    if (post && isEditing !== null && isEditing !== post.id) {
      setIsEditing(null);
    }

    if (!["local", "pending"].includes(getIdType(post.id))) {
      if (selectedPost) {
        router.push(`/forum/courses/${course.id}/forum/${post.local_id}`);
      } else {
        router.push(`/forum/courses/${course.id}/forum/${post.local_id}`);
      }
    }
    setSelectedPost(post as Post);
  }

  return (
    <forumPostsContext.Provider
      value={{
        selectedPost,
        listofPosts,
        isEditing,
        drafts,
        setSelectedPost: setPostAndRoute,
        setListOfPosts,
        setIsEditing,
        setDrafts,
        edittingSelectPost,
      }}
    >
      {children}
    </forumPostsContext.Provider>
  );
}
