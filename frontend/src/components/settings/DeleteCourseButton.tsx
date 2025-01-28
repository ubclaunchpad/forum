import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/utils/helpers";

interface DeleteCourseButtonProps {
  courseId: string;
  courseName: string;
  token: string;
}

export function DeleteCourseButton({
  courseId,
  courseName,
  token,
}: DeleteCourseButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/courses/${courseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      toast({
        title: "Success",
        description: "Course deleted successfully",
      });

      // Redirect to courses page
      router.push("/forum/courses");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <div className="border-t border-neutral-200 mt-8 pt-8">
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
          <p className="text-sm text-neutral-500">
            Once you delete a course, there is no going back. Please be certain.
          </p>
          <Button
            variant="solid"
            className="bg-red-600 hover:bg-red-700"
            onClick={() => setIsOpen(true)}
          >
            Delete Course
          </Button>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{courseName}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
