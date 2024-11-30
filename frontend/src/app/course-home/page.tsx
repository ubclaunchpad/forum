"use client";

import CourseNavbar from "@/components/course/courseNavbar";
import Sidebar from "@/components/navigation/sidebar";
import { Suspense } from "react";

export default function CourseHomePage() {
  return (
    <div className="min-h-screen bg-background flex justify-center items-start">
      <Suspense>
        <CourseNavbar />
      </Suspense>
      <Sidebar/>
    </div>
  );
}
