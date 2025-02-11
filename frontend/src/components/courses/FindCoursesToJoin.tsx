"use client";

import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Course } from "@/lib/types/course";
import { userContext } from "@/contexts/userContext";
import { getApiUrl } from "@/utils/helpers";
import { useToast } from "@/hooks/use-toast";

export default function FindCoursesToJoin() {
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { token, user } = useContext(userContext);
  const { courses, removeCourse } = useGetOpenCourses(token);
  const { toast } = useToast();

  const handleJoinByInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    try {
      const res = await fetch(`${getApiUrl()}/courses/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ inviteCode }),
      });

      if (!res.ok) throw new Error("Failed to join course");
    } catch (error) {
      console.error("Failed to join course:", error);
    } finally {
      setIsJoining(false);
      setInviteCode("");
    }
  };

  const handleJoinCourse = async (courseId: string) => {
    setIsJoining(true);
    try {
      const res = await fetch(
        `${getApiUrl()}/courses/${courseId}/members/${user.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to join course");

      // Remove course from local state and cache
      removeCourse(courseId);

      toast({
        title: "Joined course",
      });

      // Handle successful join
      // You might want to redirect or update UI
    } catch (error) {
      console.error("Failed to join course:", error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h4 className="font-semibold">
          Join With Invite Code
          <span className="px-2 text-left italic text-sm font-normal text-neutral-600">
            Not supported yet
          </span>
        </h4>

        <form onSubmit={handleJoinByInvite} className="flex w-full gap-2">
          <Input
            disabled
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="Enter invite code"
            className="rounded-lg m-0"
          />
          <Button
            disabled
            type="submit"
            size={"sm"}
            // disabled={!inviteCode || isJoining}
            className="rounded-full bg-neutral-950"
          >
            Join
          </Button>
        </form>
      </div>

      <div className="flex flex-col gap-4">
        <h4 className="font-semibold">Available Courses</h4>
        <ul className="bg-neutral-100 rounded-lg divide-y divide-neutral-200 overflow-hidden">
          {courses.length === 0 ? (
            <li className="p-4 text-sm text-neutral-500 bg-neutral-50">
              No courses available to join at the moment.
            </li>
          ) : (
            courses.map((course) => (
              <li
                key={course.id}
                className="group relative bg-neutral-50 hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 p-1 py-1">
                  <div className="flex items-center gap-4">
                    <div className="grid grid-cols-[50px_50px_1fr]  gap-4">
                      <span className="truncate">{course.c_group}</span>
                      <span className="truncate">{course.code}</span>
                      <span className=" truncate">{course.name}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleJoinCourse(course.id)}
                    disabled={isJoining}
                    variant="outline"
                    size={"icon"}
                    className="opacity-0 disabled:opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Join
                  </Button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

const getCachedData = (key: string) => {
  try {
    const stored = sessionStorage.getItem(key);
    if (!stored) return null;

    const { data, timestamp } = JSON.parse(stored);
    const TEN_MINUTES = 10 * 60 * 1000;

    if (Date.now() - timestamp > TEN_MINUTES) {
      sessionStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// Helper to set cached data with timestamp
const setCachedData = (key: string, data: object) => {
  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      }),
    );
  } catch (error) {
    console.error("Error setting cache:", error);
  }
};

async function fetchOpenCourses(token: string) {
  try {
    const res = await fetch(`${getApiUrl()}/courses?access=open`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch open courses");

    const data = await res.json();
    return data.courses;
  } catch (error) {
    console.error("Error fetching open courses:", error);
    return [];
  }
}

function useGetOpenCourses(token: string | undefined) {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const initializeCourses = async () => {
      if (!token) return;

      // Try to get cached data first
      const cachedCourses = getCachedData("openCourses");
      if (cachedCourses) {
        setCourses(cachedCourses);
        // return;
      }

      // If no cached data, fetch from API
      const fetchedCourses = await fetchOpenCourses(token);
      setCourses(fetchedCourses);
      setCachedData("openCourses", fetchedCourses);
    };

    initializeCourses();
  }, [token]);

  const updateCourses = (newCourses: Course[]) => {
    setCourses(newCourses);
    setCachedData("openCourses", newCourses);
  };

  const removeCourse = (courseId: string) => {
    const updatedCourses = courses.filter((c) => c.id !== courseId);
    updateCourses(updatedCourses);
  };

  return {
    courses,
    updateCourses,
    removeCourse,
  };
}
