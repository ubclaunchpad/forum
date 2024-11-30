"use client";

import { Button } from "@/components/ui/button";
import { useCustomSearchParams } from "@/utils/useCustomSearchParams";
import { Megaphone, MessagesSquare, FileText } from "lucide-react";

const tabs = [
  {
    name: "announcements",
    icon: Megaphone,
    label: "Announcements",
  },
  {
    name: "forum",
    icon: MessagesSquare,
    label: "Forum",
  },
  {
    name: "resources",
    icon: FileText,
    label: "Resources",
  }
]



export default function CourseNavbar() {
  const searchParams = useCustomSearchParams();
  const tab = searchParams.get(["tab"])["tab"];

  const isSelected = (currentTab: string) => tab === currentTab;

  return (
    <div className="flex justify-between items-center w-full border-b  px-2 border-b-neutral-200">
      <div className="flex gap-8">
        {tabs.map((tab) => (
          <Button
            key={tab.name}
            variant="ghost"
            size="lg"
            onClick={() => searchParams.set({ tab: tab.name })}
            className={`flex items-center border-b-2 rounded-none   border-transparent gap-2 px-3 py-2 h-9  ${
              isSelected(tab.name)
                ? "text-primary-600 border-primary-600  "
                : "text-foreground"
            }`}
          >
            <tab.icon />
            {tab.label}
          </Button>
        ))}
        
      </div>
    </div>
  );
}
