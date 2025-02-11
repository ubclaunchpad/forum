"use client";

import { SettingsSubSection } from "@/components/settings/SettingsTitleHeader";
import { Input } from "@/components/ui/input";
import { Course } from "@/lib/types/course";
import { useCourseStore } from "@/providers/courseStoreProvider";

type EditableFields = Pick<Course, "name" | "code" | "c_group" | "section">;
type EditableFieldId = keyof EditableFields;

const courseFields: Array<{
  id: EditableFieldId;
  label: string;
}> = [
  { id: "name", label: "Course Name" },
  { id: "code", label: "Course Code" },
  { id: "c_group", label: "Course Group" },
  { id: "section", label: "Section" },
];

export default function CourseGeneralSettingsSection() {
  const course = useCourseStore((state) => state.pendingCourse);
  const updatePendingCourse = useCourseStore(
    (state) => state.updatePendingCourse,
  );

  return (
    <SettingsSubSection
      id="course"
      title={"Course"}
      description={"Manage your course details and settings"}
    >
      <form className="space-y-8">
        <div className="space-y-4">
          {courseFields.map((field) => (
            <div key={field.id} className="grid gap-2">
              <label htmlFor={field.id} className="text-sm font-medium">
                {field.label}
              </label>
              <Input
                id={field.id}
                value={course[field.id]}
                onChange={(e) =>
                  updatePendingCourse({ [field.id]: e.target.value })
                }
                className="w-full"
              />
            </div>
          ))}
        </div>
      </form>
    </SettingsSubSection>
  );
}
