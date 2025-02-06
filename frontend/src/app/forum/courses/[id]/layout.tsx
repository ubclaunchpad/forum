import ClientWrapper from "./(core)/resources/wrapper";
import { getApiUrl } from "@/utils/helpers";
import { Course } from "@/lib/types/course";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CourseStoreProvider } from "@/providers/courseStoreProvider";

async function getCourse(id: string, token: string) {
  try {
    const res = await fetch(`${getApiUrl()}/courses/${id}`, {
      next: {
        revalidate: 3600,
        tags: [`course-${id}`],
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
    return body as Course;
  } catch (e) {
    console.error("Error fetching course:", e);
    return null;
  }
}

export default async function CoursePage({
  params,
  children,
}: {
  params: { id: string };
  children: React.ReactNode;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const token = (await supabase.auth.getSession())?.data.session?.access_token;
  if (!token) {
    redirect("/auth/login");
  }

  const course = await getCourse(id, token!);

  if (!course) {
    redirect("/courses");
  }

  const store = {
    course: course,
    pendingCourse: course,
  };

  return (
    <CourseStoreProvider initState={store}>
      <div className="course  flex flex-col h-dvh w-dvw overflow-hidden">
        <ClientWrapper>{children}</ClientWrapper>
      </div>
    </CourseStoreProvider>
  );
}
