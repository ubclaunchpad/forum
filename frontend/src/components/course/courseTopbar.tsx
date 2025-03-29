"use client";

import { ArrowLeftIcon, LogOutIcon, Settings2Icon } from "lucide-react";
import { Fragment, useContext, useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { userContext } from "@/providers/userContext";
import { useCourseStore } from "@/providers/courseStoreProvider";
import { getApiUrl } from "@/utils/helpers";
import { useRouter } from "next/navigation";
import { ProfileButton } from "../general/ProfileButton";
import { Searcher } from "../search/searcher";
export function CourseTopbar() {
  return (
    <div className="flex flex-shrink-0  relative justify-between w-full items-center py-2 px-2">
      <CourseButton />
      <div className="flex flex-1 gap-2 justify-end">
        <Searcher />
        <ProfileButton />
      </div>
    </div>
  );
}

function CourseButton() {
  const [isOpen, setIsOpen] = useState(false);
  const course = useCourseStore((state) => state.course);
  const { user, token, profile } = useContext(userContext);
  const courseName = `${course.department} ${course.code} ${course.name}`;
  const router = useRouter();

  async function leaveCourse() {
    try {
      const res = await fetch(
        `${getApiUrl()}/courses/${course.id}/members/${user.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to leave course");

      router.push("/forum/courses");
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  return (
    <Fragment>
      {isOpen && (
        <div className="fixed text-sm  flex z-30 flex-col gap-2 rounded-lg top-14 left-4 bg-white shadow-md border border-neutral-200">
          <section className="flex flex-col gap-1">
            <ul className="flex flex-col min-w-[200px] divide-y last:border-b">
              <Link
                href="/forum/courses"
                className="w-full no-underline hover:text-primary-500 p-1 px-2 text-sm flex items-center gap-2"
              >
                <ArrowLeftIcon className="w-4 min-h-4" />
                Back to All Courses
              </Link>
              <Link
                href={`/forum/courses/${course.id}/settings`}
                className="w-full no-underline hover:text-primary-500 p-1 px-2 text-sm flex items-center gap-2"
              >
                <Settings2Icon className="w-4 min-h-4" />
                Course Settings
              </Link>

              <button
                disabled={false}
                className="w-full  disabled:hover:text-neutral-400  hover:text-red-500 p-1 px-2 text-sm flex items-center gap-2"
                onClick={leaveCourse}
              >
                <LogOutIcon className="w-4 min-h-4" />
                Leave Course
              </button>
            </ul>
          </section>
        </div>
      )}
      <div className={cn("relative", isOpen ? "z-20" : "")}>
        <Button
          variant="outline"
          size="md"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "border-neutral-200 border h-10 px-4 text-neutral-600 text-left overflow-hidden transition-all",
            isOpen ? "shadow-lg max-w-none" : "shadow-sm max-w-[28rem]",
          )}
        >
          <span className={cn("block", isOpen ? "" : "truncate")}>
            {courseName}
          </span>
        </Button>
      </div>
    </Fragment>
  );
}
