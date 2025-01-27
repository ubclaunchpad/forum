"use client";

import {
  createContext,
  ReactNode,
  useEffect,
} from "react";
import { Course } from "@/lib/types/course";
import { generatePalette, hexToHSL } from "@/lib/utils";

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
  course,
}: {
  children: ReactNode;
  course: Course;
}) {

  // Apply theme when course info changes
  useEffect(() => {
    if (!course.config) return;
    const themeColour = course.config.theme_colour;
    const font = course.config.font;
    setTheme(themeColour, font)
    
  }, [course.config]);


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
    const primaryShades = generatePalette(colour)
    Object.entries(primaryShades).forEach(([shade, hsl]) => {
      root.style.setProperty(`--course-primary-${shade}`, hsl);
    });
  }
}
