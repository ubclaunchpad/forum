import { redirect } from "next/navigation";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  redirect("/forum/courses/" + id + "/forum");

  return null;
}
