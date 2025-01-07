import CourseNavbar from "@/components/course/courseNavbar";
import { CourseTopbar } from "@/components/course/courseTopbar";
import { CourseContextProvider } from "@/contexts/courseContext";
import ClientWrapper from "./resources/wrapper";
import { ViewTransitions } from 'next-view-transitions'


export default async function CoursePage({
  params,
  children,
}: {
  params: { id: string };
  children: React.ReactNode;
}) {
  const { id } = await params;
  return (
    <ViewTransitions>
    <CourseContextProvider id={id}>
      <div className="flex flex-col max-h-dvh h-dvh w-dvw overflow-hidden">
        <ClientWrapper>
          <CourseTopbar />
          <CourseNavbar />
          {children}
        </ClientWrapper>
      </div>
    </CourseContextProvider>
    </ViewTransitions>
  );
}
