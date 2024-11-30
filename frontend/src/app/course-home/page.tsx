"use client";

import CourseNavbar from "./course-navbar";
import { Suspense } from "react";

export default function CourseHomePage() {
  return (
    <div className="min-h-screen bg-background flex justify-center items-start">
      <Suspense>
        <CourseNavbar />
      </Suspense>
    </div>
  );
}
