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
import { Course } from "@/lib/types/course";
import { hexToHSL } from "@/lib/utils";

const fonts = {
  "space-grotesk": "var(--font-space-grotesk)",
  "inter": "var(--font-inter)",
  "raleway": "var(--font-raleway)",
  "roboto-mono": "var(--font-roboto-mono)",
  "playfair-display": "var(--font-playfair-display)",
  "quicksand": "var(--font-quicksand)",
  "source-sans": "var(--font-source-sans)",
} as const;

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
    setCourse(courseResp);
  }, [id, token]);

  // Apply theme when course info changes
  useEffect(() => {
    if (!course.config) return;

    const themeColour = course.config.theme_colour;
    const font = course.config.font;
    setTheme(themeColour, font)
    
  }, [course.config]);

  useEffect(() => {
    getCourse();
  }, [getCourse]);

  if (!course.id) {
    return <div></div>;
  }
  
  return (
    <courseContext.Provider value={course}>{children}</courseContext.Provider>
  );
}

export function setTheme(colour?: string, font?: string) {
  const root = document.documentElement;
  
  if (font && font in fonts) {
    root.style.setProperty('--course-font-title', fonts[font as keyof typeof fonts]);
    root.style.setProperty('--course-font-body', fonts[font as keyof typeof fonts]);
  }
  
  if (colour) {
    // Convert colour to HSL
    const colorHSL = hexToHSL(colour);
    
    // Generate primary shades
    const primaryShades = {
      50: `hsl(${colorHSL.h}, ${colorHSL.s * 0.6}%, 94%)`,
      100: `hsl(${colorHSL.h}, ${colorHSL.s * 0.8}%, 86%)`,
      200: `hsl(${colorHSL.h}, ${colorHSL.s}%, 76%)`,
      300: `hsl(${colorHSL.h}, ${colorHSL.s}%, 66%)`,
      400: `hsl(${colorHSL.h}, ${colorHSL.s}%, 55%)`,
      500: `hsl(${colorHSL.h}, ${colorHSL.s}%, 50%)`,
      600: colour,
      700: `hsl(${colorHSL.h}, ${colorHSL.s}%, 35%)`,
      800: `hsl(${colorHSL.h}, ${colorHSL.s}%, 25%)`,
      900: `hsl(${colorHSL.h}, ${colorHSL.s * 1.1}%, 15%)`,
      950: `hsl(${colorHSL.h}, ${colorHSL.s * 1.2}%, 7%)`
    };
    
    Object.entries(primaryShades).forEach(([shade, hsl]) => {
      root.style.setProperty(`--course-primary-${shade}`, hsl);
    });
  }
}
