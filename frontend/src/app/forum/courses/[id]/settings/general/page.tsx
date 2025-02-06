"use client";

import AppearanceSection from "@/components/settings/AppearanceSection";
import CourseGeneralSettingsSection from "@/components/settings/CourseGeneralSettings";
import { FeaturesSection } from "@/components/settings/ExperimentsSection";
import SettingsTitleHeader from "@/components/settings/SettingsTitleHeader";

export default function CourseSection() {
  return (
    <div className="space-y-6 w-full">
      <SettingsTitleHeader title={"General"} description={" "} />
      <CourseGeneralSettingsSection />
      <AppearanceSection />
      <FeaturesSection />
    </div>
  );
}
