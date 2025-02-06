"use client";

import { useCourseStore } from "@/providers/courseStoreProvider";
import { Button } from "../ui/button";
import { isDeepEqual } from "@/lib/utils";

export default function SettingsTopBar() {
  const course = useCourseStore((state) => state.course);
  const pendingCourse = useCourseStore((state) => state.pendingCourse);
  const isDifferent = !isDeepEqual(course, pendingCourse);
  const resetPendingChanges = useCourseStore(
    (state) => state.resetPendingChanges,
  );

  return (
    <div className="h-20 fixed top-2 flex-shrink-0 max-w-4xl flex justify-center items-center p-4 w-full">
      {isDifferent && (
        <div className="  flex justify-end gap-4  rounded-full  w-full  p-2">
          <Button
            className="shadow-md"
            variant={"outline"}
            type="submit"
            onClick={() => resetPendingChanges()}
          >
            Discard
          </Button>
          <Button className="shadow-md" type="submit">
            Save
          </Button>
        </div>
      )}
    </div>
  );
}
