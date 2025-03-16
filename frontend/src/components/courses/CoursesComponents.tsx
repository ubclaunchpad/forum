import {  CardContent } from "@/components/ui/card";
import { getApiUrl } from "@/utils/helpers";
import { Course } from "@/lib/types/course";
import {  Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { generatePalette, Palette } from "@/lib/utils";
import UserCoursesComponent from "./CoursesCard";
async function getCourses(token: string) {
  try {

    console.log(`${getApiUrl()}/courses`);

    const res = await fetch(`${getApiUrl()}/courses`, {
      next: {
        tags: [`courses`],
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(res);
    let error: null | string = null;
    if (!res.ok) {
      error = "Failed to fetch courses"
      return { data: [], error: error };
    }

    const body = await res.json() as { courses: Course[] };
    return {
      data: body.courses,
      error: error
    }
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      return { data: [], error: "Request timed out after 3 seconds" };
    }
    return { data: [], error: (e as Error).message };
  }
}


export async function CoursesCard() {
  const supabase = await createClient();
  const token = (await supabase.auth.getSession())?.data.session?.access_token;
  if (!token) {
    redirect("auth/login");
  }
  const { data: courses, error } = await getCourses(token);


  const shades: Record<string, Palette> = {};

  courses.map((c) => {
    if (c.config && c.config.theme_colour) {
      shades[c.id] = generatePalette(c.config.theme_colour);
    }
  });

  return (
    <UserCoursesComponent courses={courses} shades={shades} error={error} />
  )
}


export function CourseCardSkeleton() {
  return (
    <CardContent className="flex-1 px-0 py-0 w-full relative flex flex-col  ">
     
    <div className="flex flex-col w-full justify-center items-center flex-1">
      <div className="w-fit p-2 border shadow-sm flex items-center gap-3 rounded-lg">
        <Loader2 className="w-4 h-4 animate-spin" />
        <p>Getting your courses...</p>
      </div>
    </div>
    <div className="loading-shimmer" />
    </CardContent>
  )
}
