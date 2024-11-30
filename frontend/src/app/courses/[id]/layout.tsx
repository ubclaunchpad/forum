
"use client";

import CourseNavbar from "@/components/course/courseNavbar";
import { SearchIcon } from "lucide-react";

export default function CoursePage({children}: {children: React.ReactNode}) {
    return (
        <div className="flex flex-col h-dvh w-dvw">
            <CourseTopbar />
            <CourseNavbar />
            {children}
        </div>
    )
}



function CourseTopbar() {
    return (
        <div className="flex justify-center w-full items-center py-4">
            <Searchbar />
            </div>
    )

}


function Searchbar() {
    return (
        <div className="flex items-center rounded-full  min-w-[600px] border overflow-hidden">
            <input type="text" placeholder="Search for something" className="px-2 h-12 outline-none w-full" />
            <button className="  px-4 py-2 rounded-full">
                <SearchIcon />
            </button>
        </div>
    )
}