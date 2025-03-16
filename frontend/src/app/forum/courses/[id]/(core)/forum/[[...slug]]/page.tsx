import { getApiUrl } from "@/utils/helpers";
import { Post } from "@/lib/types/posts";
import { PostsForumPage } from "@/components/posts/PostsForumPage";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function getPosts(id: string, token: string) {
  try {
    const res = await fetch(`${getApiUrl()}/courses/${id}/posts`, {
      cache: "force-cache",
      next: {
        revalidate: 3600,
        tags: [`course-${id}-posts`],
      },
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
     return {
      posts: [],
      error: `Failed to fetch posts: ${res.status}`,
     }
    }

    const body = await res.json();
    return {
      posts: (body.posts as Post[]).map((post) => ({
        ...post,
        id: post.id.toString(),
      })),
      error: null,
    }
  } catch (e) {
    console.error("Error fetching posts:", e);
    return {
      posts: [],
      error: (e as Error).message,
    }
  }
}

export default async function ForumWrapper({
  params,
}: {
  params: Promise<{ id: string; slug: string[] | undefined }>;
}) {
  const { id, slug } = await params;
  return <Suspense fallback={<PostsForumPage posts={[]} initalPost={undefined} />}>
    <Forum id={id} slug={slug} />
  </Suspense>
}


async function Forum({id, slug}: {id: string, slug: string[] | undefined}){

  const selectPost = slug ? slug[0] : undefined;
  const supabase = await createClient();
  const token = (await supabase.auth.getSession())?.data.session?.access_token;
  if (!token) {
    redirect("auth/login");
  }
  const {posts} = await getPosts(id, token);
  return <PostsForumPage posts={posts} initalPost={selectPost} />;
}