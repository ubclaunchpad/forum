import CourseNavbar from "@/components/course/courseNavbar";
import { CourseTopbar } from "@/components/course/courseTopbar";
import { Toaster } from "@/components/ui/toaster";
import { CourseContextProvider } from "@/contexts/courseContext";

export default function CoursePage({
  params,
  children,
}: {
  params: { id: string };
  children: React.ReactNode;
}) {
  const { id } = params;
  return (
    <CourseContextProvider id={id}>
      <div className="flex flex-col h-dvh w-dvw">
        <CourseTopbar />
        <CourseNavbar />
        {children}
        <Toaster />
      </div>
    </CourseContextProvider>
  );
}
