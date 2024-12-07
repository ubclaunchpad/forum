"use client";

import { courseContext } from "@/contexts/courseContext";
import { SearchIcon, UserIcon } from "lucide-react";
import { useContext } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Searchbar } from "./searchBar";

export function CourseTopbar() {
  const course = useContext(courseContext);
  const courseName = `${course.info.c_group} ${course.info.code} ${course.info.name}`;

  return (
    <div className="flex relative justify-between  w-full items-center py-4 px-4 ">
      <Button
        variant="outline"
        size="md"
        className="border-neutral-200 border h-12 px-4 text-neutral-600"
      >
        <Link href="/forum/courses" className="no-underline font-semibold">
          {courseName}
        </Link>
      </Button>
      <Searchbar />
      <ProfileButton />
    </div>
  );
}

function ProfileButton() {
  return (
    <div className="text-neutral-500 flex border border-neutral-200 justify-center items-center w-12 h-12 rounded-full bg-neutral-100 gap-2">
      <UserIcon />
    </div>
  );
}
