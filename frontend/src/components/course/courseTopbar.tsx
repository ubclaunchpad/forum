"use client";

import { courseContext } from "@/contexts/courseContext";
import { SearchIcon, UserIcon } from "lucide-react";
import { useContext } from "react";
import { Button } from "../ui/button";
import Link from "next/link";

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

function Searchbar() {
  return (
    <div className="flex items-center rounded-full  min-w-[600px] border overflow-hidden absolute left-1/2 transform -translate-x-1/2">
      <input
        type="text"
        placeholder="Search for something"
        className="px-2 h-12 outline-none w-full"
      />
      <button className="  px-4 py-2 rounded-full">
        <SearchIcon />
      </button>
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
