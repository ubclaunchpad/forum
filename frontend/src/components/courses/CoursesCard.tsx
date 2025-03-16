"use client";
import { Course } from "@forum/shared";
import { MousePointer, ArrowRightCircleIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { CardContent } from "../ui/card";
import { Palette } from "@/lib/utils";

export default function UserCoursesComponent({
  courses,
  shades,
  error,
}: {
  courses: Course[];
  shades: Record<string, Palette>;
  error: null | string;
}) {
  if (error) {
    return (
      <>
        <div className="flex flex-col w-full justify-center items-center flex-1">
          <div className="w-fit p-2 border shadow-sm flex items-center gap-3 rounded-lg">
            <p>Error loading courses</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CardContent className="flex-1 px-0 py-0   flex flex-col w-full ">
        <div className="flex items-center border-b p-4 w-full  justify-between">
          <h3 className="font-semibold">Your Courses</h3>
          <Link href="/forum/courses/new" className="hidden">
            <Button variant="solid" size="sm" disabled className="bg-neutral-950">
              Add Course
            </Button>
          </Link>
        </div>
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
          <ul className="bg-neutral-100  border-neutral-200 overflow-hidden ">
            {courses.map((course: Course) => (
              <li key={course.id} className="group relative">
                <Link
                  className="flex no-underline items-center border-b border-neutral-200 justify-between gap-2 p-2 bg-neutral-50 relative"
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
    </>
  );
}
