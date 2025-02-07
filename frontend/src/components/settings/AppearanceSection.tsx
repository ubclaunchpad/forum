"use client";

import { SettingsSubSection } from "@/components/settings/SettingsTitleHeader";
import { colorOptions, fontOptions } from "@/lib/course-settings";
import { generatePalette } from "@/lib/utils";
import { useCourseStore } from "@/providers/courseStoreProvider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AppearanceSection() {
  const course = useCourseStore((state) => state.pendingCourse);
  const updatePendingCourse = useCourseStore(
    (state) => state.updatePendingCourse,
  );

  const selectedColor = course.config?.theme_colour || "#2563EB";
  const selectedFont = course.config?.font || "default";

  return (
    <SettingsSubSection
      id="appearance"
      title="Appearance"
      description="Customize how your course looks for everyone."
    >
      {/* Color Select */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Theme Color</label>
        <Select
          value={selectedColor}
          onValueChange={(value) =>
            updatePendingCourse({
              config: {
                ...course.config,
                theme_colour: value,
              },
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: selectedColor }}
                />
                {colorOptions.find((c) => c.value === selectedColor)?.label}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {colorOptions.map((color) => {
                const palette = generatePalette(color.value);
                return (
                  <SelectItem
                    key={color.value}
                    value={color.value}
                    className="py-2 flex items-center flex-row justify-between gap-2 w-full"
                  >
                    <div className="space-y-1 gap-2 flex flex-1 justify-between w-full items-center">
                      <div className="flex items-center w-40 gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: color.value }}
                        />
                        {color.label}
                      </div>
                      <div className="flex w-80 h-10 rounded overflow-hidden">
                        <div
                          className="flex-1 flex items-center justify-center text-[10px] text-white"
                          style={{ backgroundColor: palette[100] }}
                        />
                        <div
                          className="flex-1 flex items-center justify-center text-[10px] text-white"
                          style={{ backgroundColor: palette[300] }}
                        />
                        <div
                          className="flex-1 flex items-center justify-center text-[10px] text-white"
                          style={{ backgroundColor: palette[500] }}
                        />
                        <div
                          className="flex-1 flex items-center justify-center text-[10px] text-white"
                          style={{ backgroundColor: palette[700] }}
                        >
                          <div
                            className="flex-1 flex items-center justify-center text-[10px] text-white"
                            style={{ backgroundColor: palette[900] }}
                          />
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Font Select */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Font Family</label>
        <Select
          value={selectedFont}
          onValueChange={(value) =>
            updatePendingCourse({
              config: {
                ...course.config,
                font: value,
              },
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {fontOptions.find((f) => f.value === selectedFont)?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {fontOptions.map((font) => (
                <SelectItem
                  key={font.value}
                  value={font.value}
                  className={font.className}
                >
                  {font.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </SettingsSubSection>
  );
}
