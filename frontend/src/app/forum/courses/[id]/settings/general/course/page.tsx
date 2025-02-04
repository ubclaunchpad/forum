"use client";

import { Input } from "@/components/ui/input";
import { courseContext } from "@/contexts/courseContext";
import { useContext, useState } from "react";

export default function CourseSection() {
  const course = useContext(courseContext);
  const [formData, setFormData] = useState({
    name: course.name || "",
    code: course.code || "",
    c_group: course.c_group || "",
    section: course.section || "",
  });

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Course</h1>
        <p className="text-sm text-neutral-500">
          Manage your course details and settings
        </p>
      </div>

      <form className="space-y-8">
        <div className="space-y-4">
          {[
            { id: "name", label: "Course Name" },
            { id: "code", label: "Course Code" },
            { id: "c_group", label: "Course Group" },
            { id: "section", label: "Section" },
          ].map((field) => (
            <div key={field.id} className="grid gap-2">
              <label htmlFor={field.id} className="text-sm font-medium">
                {field.label}
              </label>
              <Input
                id={field.id}
                value={formData[field.id as keyof typeof formData]}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    [field.id]: e.target.value,
                  }))
                }
                className="max-w-lg"
              />
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}
