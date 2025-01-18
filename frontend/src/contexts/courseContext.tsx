"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getApiUrl } from "@/utils/helpers";
import { userContext } from "./userContext";

export type Course = {
  info: {
    config?: {
      theme_colour?: string;
      font?: string;
    };
    [key: string]: unknown;
  };
};

export const courseContext = createContext({} as Course);

export function CourseContextProvider({
  children,
  id,
}: {
  children: ReactNode;
  id: string;
}) {
  const [course, setCourse] = useState<Course>({} as Course);
  const { token } = useContext(userContext);

  const getCourse = useCallback(async () => {
    const res = await fetch(`${getApiUrl()}/courses/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const courseResp = await res.json();
    setCourse({
      info: courseResp,
    });
  }, [id, token]);

  useEffect(() => {
    getCourse();
  }, [getCourse]);

  if (!course.info) {
    return <div></div>;
  }

  return (
    <courseContext.Provider value={course}>{children}</courseContext.Provider>
  );
}
