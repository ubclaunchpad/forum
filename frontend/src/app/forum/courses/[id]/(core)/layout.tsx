import CourseNavbar from "@/components/course/courseNavbar";
import { CourseTopbar } from "@/components/course/courseTopbar";

export default async function CourseCoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CourseTopbar />
      <CourseNavbar />
      {children}
     
    </>
  );
}
