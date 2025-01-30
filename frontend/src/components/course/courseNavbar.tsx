"use client";

import { MessagesSquare, FileText, UsersIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    name: "forum",
    icon: MessagesSquare,
    label: "Forum",
    href: "forum",
    disabled: false,
  },
  {
    name: "resources",
    icon: FileText,
    label: "Resources",
    href: "resources",
    disabled: false,
  },
  {
    name: "people",
    icon: UsersIcon,
    label: "People",
    href: "people",
    disabled: false,
  },
];

export default function CourseNavbar() {
  const pathname = usePathname();
  const path = pathname.split("/");
  if (
    path.length < 5 &&
    !["forum", "announcements", "resources", "people"].includes(path[4])
  ) {
    path.push("forum");
  }
  const tab = path[4];
  const courseid = path[3];
  const isSelected = (currentTab: string) => tab === currentTab;

  return (
    <div className="flex justify-between items-center w-full border-b  px-2 border-b-neutral-200">
      <div className="flex gap-8">
        {tabs.map((tab) => (
          <Link
            aria-disabled={tab.disabled}
            href={tab.disabled ? "#" : `/forum/courses/${courseid}/${tab.href}`}
            key={tab.name}
            className={`flex items-center no-underline  border-b-2 rounded-none font-semibold  normal  border-transparent gap-2 px-3 py-2 h-9 
             ${
               isSelected(tab.name)
                 ? "text-primary-600 border-b-primary-600  "
                 : "text-neutral-600 hover:text-neutral-900  border-b-transparent "
             }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
