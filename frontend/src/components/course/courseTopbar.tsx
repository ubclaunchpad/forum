"use client";

import { courseContext } from "@/contexts/courseContext";
import { SmileIcon } from "lucide-react";
import { Fragment, useContext, useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Searchbar } from "./searchBar";
import { signOut } from "./actions";

export function CourseTopbar() {
  const course = useContext(courseContext);
  const courseName = `${course.info.c_group} ${course.info.code} ${course.info.name}`;

  return (
    <div className="flex relative justify-between  w-full items-center py-2 px-2 ">
      <Button
        variant="outline"
        size="md"
        className="border-neutral-200 border h-10 px-4 text-neutral-600"
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
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Fragment>
      {isOpen && (
        <div className="fixed rounded-lg px-10 top-12 right-4 bg-white p-1 shadow-sm border border-neutral-200">
          <button
            className="no-underline hover:text-primary-500"
            onClick={() => signOut()}
          >
            Logout
          </button>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-neutral-500 flex border border-neutral-200 justify-center items-center w-10 h-10 rounded-full bg-white gap-2"
      >
        <SmileIcon size={24} />
      </button>
    </Fragment>
  );
}
