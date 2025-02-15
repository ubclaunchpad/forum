import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getApiUrl } from "@/utils/helpers";
import Link from "next/link";
import { Course } from "@/lib/types/course";
import { ArrowRightCircleIcon, MousePointer } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { generatePalette, Palette } from "@/lib/utils";
import { ProfileButton } from "@/components/general/ProfileButton";

async function getCourses(token: string) {
  try {
    const res = await fetch(`${getApiUrl()}/courses`, {
      next: {
        tags: [`courses`],
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch posts: ${res.status}`);
    }

    const body = await res.json();
    return body as { courses: Course[] };
  } catch (e) {
    console.error("Error fetching course:", e);
    return { courses: [] };
  }
}

export default async function CoursesPage() {
  const supabase = await createClient();
  const token = (await supabase.auth.getSession())?.data.session?.access_token;
  if (!token) {
    redirect("auth/login");
  }
  const { courses } = await getCourses(token);

  const shades: Record<string, Palette> = {};

  courses.map((c) => {
    if (c.config && c.config.theme_colour) {
      shades[c.id] = generatePalette(c.config.theme_colour);
    }
  });

  return (
    <div className="flex flex-col w-dvw h-dvh overflow-hidden bg-neutral-100 ">
      <nav className="flex w-full min-h-16  items-center px-4">
        <div className="flex-1 flex items-center"></div>
        <ProfileButton />
      </nav>
      <div className="flex-1 flex flex-col  items-center  justify-center">
        <Card className="w-full max-w-3xl rounded-xl bg-neutral-50  ">
          <div className="flex items-center border-b p-4 justify-between">
            <h3 className="font-semibold">Your Courses</h3>
            <Link href="/forum/courses/new">
              <Button variant="solid" size="sm" className="bg-neutral-950">
                Add Course
              </Button>
            </Link>
          </div>
          <CardContent className="flex-1 px-0 py-0 max-h-[60dvh] flex flex-col min-h-[600px] h-full">
            {!courses ||
              (courses.length == 0 && (
                <div className="flex  flex-col w-full justify-center items-center flex-1">
                  <div className="w-fit p-2 border shadow-sm flex items-center gap-3 rounded-lg">
                    <MousePointer className="w-4 h-4" />
                    <p>Click the add course button to join your first course</p>
                  </div>
                </div>
              ))}
            {courses.length > 0 && (
              <ul className="bg-neutral-100  border-neutral-200 overflow-hidden last:border-b">
                {courses.map((course: Course) => (
                  <li key={course.id} className="group relative">
                    <Link
                      className="flex no-underline items-center border-t border-neutral-200 justify-between gap-2 p-2 bg-neutral-50 relative"
                      href={`/forum/courses/${course.id}/forum`}
                    >
                      <div
                        className="absolute w-full flex justify-end items-center  p-2 inset-0 opacity-0 group-hover:opacity-100 group-hover:bg-opacity-10 transition-opacity"
                        style={{
                          background: `linear-gradient(40deg,
                   transparent 0%,
                   ${shades[course.id]?.[50] || "var(--primary-50)"} 40%,
                   ${shades[course.id]?.[100] || "var(--primary-100)"} 100%)`,
                        }}
                      >
                        <ArrowRightCircleIcon
                          className=" w-4 h-4"
                          style={{
                            stroke: `${shades[course.id]?.[600] || "var(--primary-600)"}`,
                            color: `${shades[course.id]?.[600] || "var(--primary-600)"}`,
                          }}
                        />
                      </div>

                      {/* Content (now in a wrapper to ensure it stays above the gradient) */}
                      <div className="relative z-10 flex w-full items-center justify-between gap-4">
                        <span className="w-20">{course.c_group}</span>
                        <span className="w-20">{course.code}</span>
                        <span className="w-20">{course.section}</span>
                        <span className="w-full">{course.name}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
