"use client";

import { Megaphone, MessagesSquare, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    name: "announcements",
    icon: Megaphone,
    label: "Announcements",
    href: "announcements",
  },
  {
    name: "forum",
    icon: MessagesSquare,
    label: "Forum",
    href: "forum",
  },
  {
    name: "resources",
    icon: FileText,
    label: "Resources",
    href: "resources",
  },
];

export default function CourseNavbar() {
  const pathname = usePathname();
  const path = pathname.split("/");
  if (path.length == 3) {
    path.push("announcements");
  }
  console.log(path);
  const tab = path[path.length - 1];
  const courseid = path[path.length - 2];
  const isSelected = (currentTab: string) => tab === currentTab;

  return (
    <div className="flex justify-between items-center w-full border-b  px-2 border-b-neutral-200">
      <div className="flex gap-8">
        {tabs.map((tab) => (
          <Link
            href={`/courses/${courseid}/${tab.href}`}
            key={tab.name}
            className={`flex items-center border-b-2 rounded-none  normal  border-transparent gap-2 px-3 py-2 h-9  ${
              isSelected(tab.name)
                ? "text-primary-600 border-primary-600  "
                : "text-foreground"
            }`}
          >
            <tab.icon />
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
