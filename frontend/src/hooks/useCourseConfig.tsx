import { userContext } from "@/contexts/userContext";
import { useCourseStore } from "@/providers/courseStoreProvider";
import { getApiUrl } from "@/utils/helpers";
import { useContext, useState } from "react";
import { useToast } from "./use-toast";
import { themeContext } from "@/contexts/ThemeProvider";

export default function useCourseConfig() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { token } = useContext(userContext);
  const course = useCourseStore((state) => state.course);
  const { updateTheme } = useContext(themeContext);
  const pendingCourse = useCourseStore((state) => state.pendingCourse);
  const saveCourseChanges = useCourseStore((state) => state.saveCourseChanges);

  async function updateCourseRequest() {
    try {
      const response = await fetch(`${getApiUrl()}/courses/${course.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pendingCourse),
      });

      if (!response.ok) throw new Error("Failed to update appearance");

      fetch(`/api/revalidate?tag=course-${course.id}`);

      saveCourseChanges();
      updateTheme(pendingCourse.config);

      toast({
        title: "Success",
        description: "Course updated successfully",
      });
    } catch (error) {
      console.error(error);
      setError(error as Error);
      toast({
        title: "Error",
        description: "Failed to update course settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    error,
    updateCourseRequest,
  };
}
