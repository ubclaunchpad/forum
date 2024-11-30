import { Button } from "@/components/ui/button";
import { useCustomSearchParams } from "@/utils/useCustomSearchParams";
import { Megaphone, MessagesSquare, FileText } from "lucide-react";

export default function CourseNavbar() {
  const searchParams = useCustomSearchParams();
  const tab = searchParams.get(["tab"]).tab;

  const isSelected = (currentTab: string) => tab === currentTab;

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-32">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => searchParams.set({ tab: "announcements" })}
          className={`flex items-center gap-3 px-2 py-2 h-11 rounded-none ${
            isSelected("announcements")
              ? "text-primary border-b-2 border-primary"
              : "text-foreground"
          }`}
        >
          <Megaphone />
          Announcements
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={() => searchParams.set({ tab: "forum" })}
          className={`flex items-center gap-3 px-2 py-2 h-11 rounded-none ${
            isSelected("forum")
              ? "text-primary border-b-2 border-primary"
              : "text-foreground"
          }`}
        >
          <MessagesSquare />
          Forum
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={() => searchParams.set({ tab: "resources" })}
          className={`flex items-center gap-3 px-2 py-2 h-11 rounded-none ${
            isSelected("resources")
              ? "text-primary border-b-2 border-primary"
              : "text-foreground"
          }`}
        >
          <FileText />
          Course Resources
        </Button>
      </div>
    </div>
  );
}
