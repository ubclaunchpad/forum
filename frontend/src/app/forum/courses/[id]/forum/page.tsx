import { getApiUrl } from "@/utils/helpers";
import { Post } from "@/lib/types/posts";
import { PostsForumPage } from "@/components/posts/PostsForumPage";

async function getPosts(id: string) {
  try {
    const res = await fetch(`${getApiUrl()}/courses/${id}/posts`, {
      cache: "force-cache",
      next: {
        revalidate: 3600,
        tags: [`course-${id}-posts`],
      },
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch posts: ${res.status}`);
    }

    const body = await res.json();
    return body.posts as Post[];
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
  const posts = await getPosts(id);
  return <PostsForumPage posts={posts} />;
}
