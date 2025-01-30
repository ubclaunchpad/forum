"use client";

import { courseContext } from "@/contexts/courseContext";
import {
  ArrowLeftIcon,
  BugIcon,
  ClipboardPenIcon,
  LogOutIcon,
  Settings2Icon,
  UserCircleIcon,
} from "lucide-react";
import { Fragment, useContext, useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Searchbar } from "./searchBar";
import { signOut } from "./actions";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { userContext } from "@/contexts/userContext";

export function CourseTopbar() {
  return (
    <div className="flex relative justify-between w-full items-center py-2 px-2">
      <CourseButton />
      <div className="flex flex-1 gap-2 justify-end">
        <Searchbar />
        <ProfileButton />
      </div>
    </div>
  );
}

function ProfileButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { profile } = useContext(userContext);
  return (
    <Fragment>
      {isOpen && (
        <div className="fixed text-sm flex z-20  flex-col gap-2  rounded-lg top-14 right-4 bg-white  shadow-md border border-neutral-200">
          <section className="flex flex-col gap-1  ">
            <ul className="flex flex-col min-w-[200px] divide-y  last:border-b ">
              <Link
                href={"/forum/profile"}
                className="w-full no-underline hover:text-primary-500 p-1 px-2  text-sm flex items-center gap-2 "
              >
                <UserCircleIcon className="w-4 min-h-4" />
                Profile
              </Link>

              <button
                className="w-full no-underline hover:text-primary-500 p-1  px-2  text-sm flex items-center gap-2"
                onClick={() => signOut()}
              >
                <LogOutIcon className="w-4 min-h-4" />
                Logout
              </button>
            </ul>
          </section>
          <section className="flex flex-col gap-1  pt-2">
            <label className="font-semibold text-neutral-800 px-2">
              Feedback
            </label>

            <ul className="flex flex-col min-w-[200px] divide-y  border-t">
              {process.env.NEXT_PUBLIC_BUG_FORM_URL && (
                <Link
                  href={process.env.NEXT_PUBLIC_BUG_FORM_URL}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="w-full no-underline hover:text-primary-500 p-1 px-2  text-sm flex items-center gap-2 "
                >
                  <BugIcon className="w-4 min-h-4" />
                  Report an issue
                </Link>
              )}
              {process.env.NEXT_PUBLIC_FEATURE_FORM_URL && (
                <Link
                  href={process.env.NEXT_PUBLIC_FEATURE_FORM_URL}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="w-full no-underline hover:text-primary-500 p-1 px-2  text-sm flex items-center gap-2 "
                >
                  <ClipboardPenIcon className="w-4 min-h-4" />
                  Request a feature
                </Link>
              )}
            </ul>
          </section>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "text-neutral-500 flex p-0.5 border border-neutral-200  justify-center items-center  rounded-full bg-neutral-50 gap-2",
          isOpen ? "shadow-lg" : "shadow-md",
        )}
      >
        <Avatar className="w-9 h-9">
          <AvatarImage src={profile.icon_url} className="object-cover" />
          <AvatarFallback>
            {profile.first_name[0]}
            {profile.last_name[0]}
          </AvatarFallback>
        </Avatar>
      </button>
    </Fragment>
  );
}

function CourseButton() {
  const [isOpen, setIsOpen] = useState(false);
  const course = useContext(courseContext);
  const courseName = `${course.c_group} ${course.code} ${course.name}`;

  return (
    <Fragment>
      {isOpen && (
        <div className="fixed text-sm flex z-20 flex-col gap-2 rounded-lg top-14 left-4 bg-white shadow-md border border-neutral-200">
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
                disabled
                className="w-full text-neutral-400 disabled:hover:text-neutral-400 cursor-not-allowed no-underline hover:text-primary-500 p-1 px-2 text-sm flex items-center gap-2"
                onClick={() => {
                  // Add leave course functionality here
                  console.log("Leave course clicked");
                }}
              >
                <LogOutIcon className="w-4 min-h-4" />
                Leave Course
              </button>
            </ul>
          </section>
        </div>
      )}
      <Button
        variant="outline"
        size="md"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "border-neutral-200 border h-10 px-4 text-neutral-600",
          isOpen ? "shadow-lg" : "shadow-sm",
        )}
      >
        {courseName}
      </Button>
    </Fragment>
  );
}
