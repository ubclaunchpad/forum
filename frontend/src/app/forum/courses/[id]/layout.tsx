import ClientWrapper from "./(core)/resources/wrapper";
import { getApiUrl } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CourseStoreProvider } from "@/providers/courseStoreProvider";
import { Course } from "@forum/shared";
import { SearchStoreProvider } from "@/providers/searchStoreProvider";

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
    if (body.course) {
      return body.course as Course;
    }
    return null;
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

  const [course] = await Promise.all([
    getCourse(id, token!),
    // getTags(id, token),
  ]);

  if (!course) {
    redirect("/courses");
  }

  const store = {
    course: course,
    pendingCourse: course,
    tags: [],
  };

  return (
    <CourseStoreProvider initState={store}>
      <SearchStoreProvider>
        <div className="course flex flex-col h-dvh w-dvw bg-[#FBFAF9]">
          <ClientWrapper>{children}</ClientWrapper>
        </div>
      </SearchStoreProvider>
    </CourseStoreProvider>
  );
}
