import { PostsForumPage } from "@/components/posts/PostsForumPage";

export default async function ForumWrapper({
  params,
}: {
  params: Promise<{ id: string; slug: string[] | undefined }>;
}) {
  const { slug } = await params;
  return <PostsForumPage initalPost={slug ? slug[0] : undefined} />;
}
