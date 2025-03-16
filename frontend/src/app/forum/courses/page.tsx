import { Card } from "@/components/ui/card";
import { ProfileButton } from "@/components/general/ProfileButton";
import { Suspense } from "react";
import {
  CourseCardSkeleton,
  CoursesCard,
} from "@/components/courses/CoursesComponents";

export default async function CoursesPage() {
  return (
    <div className="flex flex-col w-dvw h-dvh overflow-hidden bg-neutral-100 ">
      <nav className="flex w-full min-h-16  items-center px-4">
        <div className="flex-1 flex items-center"></div>
        <ProfileButton />
      </nav>
      <div className="flex-1 flex flex-col  items-center pb-4 justify-center">
        <Card className="w-full overflow-hidden max-w-4xl rounded-xl flex-1 flex flex-col items-center justify-center bg-neutral-50  ">
          <Suspense fallback={<CourseCardSkeleton />}>
            <CoursesCard />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
