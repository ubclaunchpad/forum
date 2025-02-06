"use client";

import { useCourseStore } from "@/providers/courseStoreProvider";
import { Button } from "../ui/button";
import { isDeepEqual } from "@/lib/utils";
import useCourseConfig from "@/hooks/useCourseConfig";

export default function SettingsTopBar() {
  const course = useCourseStore((state) => state.course);
  const pendingCourse = useCourseStore((state) => state.pendingCourse);
  const isDifferent = !isDeepEqual(course, pendingCourse);
  const resetPendingChanges = useCourseStore(
    (state) => state.resetPendingChanges,
  );

  const { updateCourseRequest, isLoading } = useCourseConfig();

  return (
    <div className="h-20 fixed top-2 flex-shrink-0 max-w-4xl flex justify-center items-center p-4 w-full">
      {isDifferent && (
        <div className="  flex justify-end gap-4  rounded-full  w-full  p-2">
          <Button
            className="shadow-md"
            variant={"outline"}
            type="submit"
            disabled={isLoading}
            onClick={() => resetPendingChanges()}
          >
            Discard
          </Button>
          <Button
            disabled={isLoading}
            className="shadow-md"
            type="submit"
            onClick={updateCourseRequest}
          >
            {isLoading ? "Saving" : "Save"}
          </Button>
        </div>
      )}
    </div>
  );
}
