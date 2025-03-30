"use client";
import { userContext } from "@/providers/userContext";
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
import ProfileAvatarIcon from "../customIcons/profile-avatar";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import ProfileFullView from "../people/ProfileFullView";

const LINKS = {
  FEATURE:
    "https://launchpadubc.notion.site/19b1e489d920810abdfccfcb42908c70?pvs=105",
  BUG: "https://launchpadubc.notion.site/19b1e489d920816681dad2d7cb17dd4e?pvs=105",
};

export function ProfileButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { profile } = useContext(userContext);
  return (
    <Fragment>
      {isOpen && (
        <div className="fixed text-sm flex z-20  flex-col gap-2  rounded-lg top-14 right-4 bg-white  shadow-md border border-neutral-200">
          <section className="flex flex-col gap-1  ">
            <ul className="flex flex-col min-w-[200px] divide-y  last:border-b ">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full w-full justify-start font-normal no-underline hover:text-primary-500 p-1 px-2  text-sm flex items-center gap-2 "
                  >
                    <UserCircleIcon className="w-4 min-h-4" />
                    Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="p-10 max-w-4xl h-full max-h-[90dvh] overflow-y-auto">
                  <ProfileFullView />
                </DialogContent>
              </Dialog>

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
              <Link
                href={LINKS.BUG}
                target="_blank"
                referrerPolicy="no-referrer"
                className="w-full no-underline hover:text-primary-500 p-1 px-2  text-sm flex items-center gap-2 "
              >
                <BugIcon className="w-4 min-h-4" />
                Report an issue
              </Link>

              <Link
                href={LINKS.FEATURE}
                target="_blank"
                referrerPolicy="no-referrer"
                className="w-full no-underline hover:text-primary-500 p-1 px-2  text-sm flex items-center gap-2 "
              >
                <ClipboardPenIcon className="w-4 min-h-4" />
                Request a feature
              </Link>
            </ul>
          </section>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "text-neutral-500 flex border-none w-10 h-10  justify-center items-center p-0 rounded-full bg-transparent gap-2",
          isOpen ? "shadow-sm" : "shadow-none",
        )}
      >
        <ProfileAvatarIcon className="w-8 h-8" />
      </button>
    </Fragment>
  );
}
