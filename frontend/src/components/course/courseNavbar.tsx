"use client";

import { cn } from "@/lib/utils";
import { MessagesSquare, FileText, TrendingUpIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useEffect } from "react";

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
    name: "insights",
    icon: TrendingUpIcon,
    label: "Insights",
    href: "insights",
    disabled: false,
  },
];

export default function CourseNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const path = pathname.split("/");
  if (
    path.length < 5 &&
    !["forum", "announcements", "resources", "insights"].includes(path[4])
  ) {
    path.push("forum");
  }
  const tab = path[4];
  const courseid = path[3];
  const isSelected = (currentTab: string) => tab === currentTab;
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sliderRef.current) {
      const element = document.getElementById(`${tab}-tab-nav`);
      if (element) {
        sliderRef.current.style.left = `${element.offsetLeft}px`;
        sliderRef.current.style.width = `${element.offsetWidth}px`;
      }
    }
  }, [tab]);

  return (
    <div className="flex flex-shrink-0 justify-between items-center w-full border-b  px-2 border-b-neutral-200">
      <div className="flex relative gap-6">
        <div
          ref={sliderRef}
          className="h-[2px] bg-primary-600 absolute bottom-0 left-0 w-0 transition-all duration-300"
        />
        {tabs.map((tab) => (
          <Link
            id={`${tab.name}-tab-nav`}
            aria-disabled={tab.disabled}
            shallow={true}
            href={tab.disabled ? "#" : `/forum/courses/${courseid}/${tab.href}`}
            key={tab.name}
            className={cn(
              `flex items-center no-underline  border-b-2 hover:text-primary-500 rounded-none font-semibold  normal  border-transparent gap-2 px-3 py-2 h-9 
            `,
              isSelected(tab.name)
                ? "text-primary-600 "
                : "text-neutral-700 border-transparent",
            )}
            onClick={() => {
              router.push(`/forum/courses/${courseid}/${tab.href}`);
              if (sliderRef.current) {
                const element = document.getElementById(`${tab.name}-tab-nav`);
                if (element) {
                  sliderRef.current.style.left = `${element.offsetLeft}px`;
                  sliderRef.current.style.width = `${element.offsetWidth}px`;
                }
              }
            }}
          >
            {tab.label}
            <tab.icon className="w-4 h-4" />
          </Link>
        ))}
      </div>
    </div>
  );
}
