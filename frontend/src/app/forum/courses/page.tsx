"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { userContext } from "@/contexts/userContext";
import { getApiUrl } from "@/utils/helpers";
import Link from "next/link";
import { useEffect, useState, useContext } from "react";
import { Course } from "@/lib/types/course";
import { Circle } from "lucide-react";

export default function CoursesPage() {
  const { token } = useContext(userContext);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (!token) return;
    const getCourses = async () => {
      const res = await fetch(`${getApiUrl()}/courses`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const { courses } = await res.json();

      return courses;
    };
    getCourses().then((courses) => setCourses(courses));
  }, [token]);

  return (
    <div className="flex flex-col w-screen h-screen items-center bg-primary-900 justify-center">
      <Card className="w-full max-w-2xl rounded-xl p-4 py-8 h-full bg-neutral-50 max-h-[600px] ">
        <div className="flex items-center pb-4 justify-between">
          <h3 className="font-semibold">Your Courses</h3>
          <Link href="/forum/courses/new">
            <Button variant="solid" size="sm">
              Add Course
            </Button>
          </Link>
        </div>
        <ul className="bg-neutral-100 rounded-lg border border-neutral-200 overflow-hidden">
          {courses.map((course: Course) => (
            <li key={course.id}>
              <Link
                className="flex no-underline items-center justify-between gap-2 p-2 rounded-lg bg-neutral-100 hover:bg-primary-100"
                href={`/forum/courses/${course.id}`}
              >
                <button>
                  <Circle size={18} color={course.config?.theme_colour} fill={course.config?.theme_colour} />
                </button>
                <span className="w-20">{course.c_group}</span>
                <span className="w-20">{course.code}</span>
                <span className="w-20">{course.section}</span>
                <span className="w-full">{course.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}