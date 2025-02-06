import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { userContext } from "@/contexts/userContext";
import { getApiUrl } from "@/utils/helpers";
import { useContext, useState } from "react";
import { DeleteCourseButton } from "./DeleteCourseButton";
import { useCourseStore } from "@/providers/courseStoreProvider";

export function CourseSection() {
  const course = useCourseStore((state) => state.course);
  const { token } = useContext(userContext);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: course.name || "",
    code: course.code || "",
    c_group: course.c_group || "",
    section: course.section || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${getApiUrl()}/courses/${course.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          code: parseInt(formData.code),
          section: parseInt(formData.section),
          c_group: formData.c_group,
          config: course.config || {},
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to update course");
      }

      toast({
        title: "Success",
        description: "Course details updated successfully",
      });
    } catch (error) {
      console.error(error);

      toast({
        title: "Error",
        description: "Failed to update course details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Course</h1>
        <p className="text-sm text-neutral-500">
          Manage your course details and settings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
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

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save changes"}
        </Button>
      </form>

      <DeleteCourseButton
        courseId={course.id}
        courseName={course.name}
        token={token}
      />
    </div>
  );
}
