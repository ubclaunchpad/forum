"use client";

import PostsForumSidebar from "./PostsForumSidebar";
import { PostsForumViewSection } from "./PostsForumViewSection";
import { PostList } from "@forum/shared";
import { useCourseStore } from "@/providers/courseStoreProvider";
import { useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { userContext } from "@/providers/userContext";
import { getApiUrl } from "@/utils/helpers";

export const PostsForumPage = ({
  initalPost,
}: {
  initalPost?: string;
}) => {
  const  setPosts = useCourseStore((state) => state.setPosts);
  const {token} = useContext(userContext);
  const course = useCourseStore((state) => state.course);
  const {data} = useQuery({
    queryKey: ["posts", course.id],
    queryFn: () => getPosts(course.id, token),
  });
  useEffect(() => {
    if (data) {
      setPosts(data.posts);
    }
  }, [data]);

  return (
      <div className="flex flex-1 overflow-hidden  ">
        <PostsForumSidebar selectedPost={initalPost} />
        <PostsForumViewSection initialPost={initalPost} />
      </div>
  );
};


async function getPosts(id: string, token: string) {
  try {
    const res = await fetch(`${getApiUrl()}/posts/courses/${id}`, {
      // next: {
      //   revalidate: 3600,
      //   tags: [`course-${id}-posts`],
      // },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(res.status);

    if (!res.ok) {
      return {
        posts: [],
        error: `Failed to fetch posts: ${res.status}`,
      };
    }

    const body = await res.json();
    console.log(body);
    return {
      posts: (body as PostList[]).map((post) => ({
        ...post,
        id: post.id.toString(),
      })),
      error: null,
    };



  } catch (e) {
    console.error("Error fetching posts:", e);
    return {
      posts: [],
      error: (e as Error).message,
    };
  }
}