"use client";

import { SettingsSubSection } from "@/components/settings/SettingsTitleHeader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { userContext } from "@/contexts/userContext";
import { getApiUrl } from "@/utils/helpers";
import { useContext, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCourseStore } from "@/providers/courseStoreProvider";

export default function CourseDangerSection() {
  const course = useCourseStore((state) => state.course);
  const { token } = useContext(userContext);
  const { toast } = useToast();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${getApiUrl()}/courses/${course.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to delete course");
      }

      toast({
        title: "Success",
        description: "Course deleted successfully",
      });

      router.push("/forum/courses");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SettingsSubSection
      id="danger"
      title="Danger Zone"
      description="Permanently delete this course and all of its data."
    >
      <div className="space-y-4 flex w-full justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="md" variant="destructive" disabled={isDeleting}>
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete Course"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="course">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <span>
                  This action cannot be undone. This will permanently delete
                  this course and remove all associated data.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Course
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SettingsSubSection>
  );
}
