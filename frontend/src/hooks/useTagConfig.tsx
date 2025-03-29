import { userContext } from "@/providers/userContext";
import { useCourseStore } from "@/providers/courseStoreProvider";
import { getApiUrl } from "@/utils/helpers";
import { useContext, useState } from "react";
import { useToast } from "./use-toast";
import { Tag } from "@/lib/types/tags";

export default function useTagsConfig() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { token, user } = useContext(userContext);
  const course = useCourseStore((state) => state.course);
  const addTag = useCourseStore((state) => state.addTag);

  async function addTagRequest({
    tagToAdd,
  }: {
    tagToAdd: Pick<Tag, "name" | "visibility">;
  }) {
    try {
      addTag({
        course_id: course.id,
        created_by: user.id,
        id: "temp-" + tagToAdd.name,
        ...tagToAdd,
        properties: null,
        parent_tag_id: null,
      });
      const response = await fetch(`${getApiUrl()}/courses/${course.id}/tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...tagToAdd,
          properties: null,
          parent_tag_id: null,
        }),
      });

      if (!response.ok) throw new Error("Failed to update appearance");

      //   const res = await response.json();

      fetch(`/api/revalidate?tag=course-${course.id}-tags`);
    } catch (error) {
      console.error(error);
      setError(error as Error);
      toast({
        title: "Error",
        description: "Failed to add tag",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    error,
    addTagRequest,
  };
}
