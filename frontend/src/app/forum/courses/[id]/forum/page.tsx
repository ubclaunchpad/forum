import { getApiUrl } from "@/utils/helpers";
import { Post } from "@/lib/types/posts";
import { PostsForumPage } from "@/components/posts/PostsForumPage";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

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
      throw new Error(`Failed to fetch posts: ${res.status}`);
    }

    const body = await res.json();
    return (body.posts as Post[]).map((post) => ({
      ...post,
      id: post.id.toString(),
    }));
  } catch (e) {
    console.error("Error fetching posts:", e);
    return [];
  }
}

export default async function Forum({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient();
  const token = (await supabase.auth.getSession())?.data.session?.access_token;
  if (!token) {
    redirect("auth/login");
  }
  const posts = await getPosts(id, token);
  return <PostsForumPage posts={posts} />;
}
