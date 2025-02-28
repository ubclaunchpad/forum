import CourseNavbar from "@/components/course/courseNavbar";
import { CourseTopbar } from "@/components/course/courseTopbar";
import { IsLoadingView } from "@/components/general/IsLoadingView";
import { Suspense } from "react";

export default async function CourseCoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CourseTopbar />
      <CourseNavbar />
      <Suspense fallback={<IsLoadingView />}>{children}</Suspense>
    </>
  );
}
