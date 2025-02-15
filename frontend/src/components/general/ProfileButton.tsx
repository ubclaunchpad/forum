"use client";
import { userContext } from "@/contexts/userContext";
import { cn } from "@/lib/utils";
import {
  UserCircleIcon,
  LogOutIcon,
  BugIcon,
  ClipboardPenIcon,
} from "lucide-react";
import { useState, useContext, Fragment } from "react";
import { signOut } from "../course/actions";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function ProfileButton() {
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
          "text-neutral-500 flex p-0.5 border border-neutral-200 w-10 h-10  justify-center items-center  rounded-full bg-neutral-50 gap-2",
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
