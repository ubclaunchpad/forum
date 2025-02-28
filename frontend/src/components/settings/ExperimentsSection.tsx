"use client";

import { Switch } from "@/components/ui/switch";
import { SettingsSubSection } from "@/components/settings/SettingsTitleHeader";
import { useCourseStore } from "@/providers/courseStoreProvider";
import { featureFlags } from "@/lib/course-settings";

type FeatureFlag = (typeof featureFlags)[number]["id"];
type FeatureFlags = {
  [K in FeatureFlag]: boolean;
};

export function FeaturesSection() {
  const course = useCourseStore((state) => state.pendingCourse);

  return (
    <SettingsSubSection
      id="features"
      title="Experimental Features"
      description="Enable or disable course features. Currently toggling these is not available per course."
    >
      <div className="space-y-6">
        {featureFlags.map((feature) => {
          const flags = course.config?.feature_flags as
            | FeatureFlags
            | undefined;
          const isEnabled = flags?.[feature.id as keyof FeatureFlags] ?? false;

          return (
            <div
              key={feature.id}
              className="flex items-center justify-between space-x-2"
            >
              <div className="space-y-0.5">
                <label htmlFor={feature.id} className="text-sm font-medium">
                  {feature.label}
                </label>
                <p className="text-sm text-neutral-500">
                  {feature.description}
                </p>
              </div>
              <Switch
                id={feature.id}
                disabled={feature.readonly}
                checked={isEnabled}
                //   onCheckedChange={() => handleToggle(feature.id)}
              />
            </div>
          );
        })}
      </div>
    </SettingsSubSection>
  );
}
