"use client";

import { CourseSection } from "@/components/settings/CourseSection";
import { AppearanceSection } from "@/components/settings/AppearanceSection";
import { useSearchParams } from "next/navigation";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const section = searchParams.get("section") || "course";

  const renderSection = () => {
    switch (section) {
      case "course":
        return <CourseSection />;
      case "appearance":
        return <AppearanceSection />;
      default:
        return <CourseSection />;
    }
  };

  return renderSection();
}