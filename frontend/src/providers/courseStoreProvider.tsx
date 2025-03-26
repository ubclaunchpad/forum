"use client";

import { themeContext } from "@/providers/ThemeProvider";
import {
  CourseState,
  CourseStore,
  createCourseStore,
} from "@/stores/courseStore";
import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

export type CourseStoreApi = ReturnType<typeof createCourseStore>;

export const CourseStoreContext = createContext<CourseStoreApi | undefined>(
  undefined,
);

export interface CounterStoreProviderProps {
  initState: CourseState;
  children: ReactNode;
}

export const CourseStoreProvider = ({
  initState,
  children,
}: CounterStoreProviderProps) => {
  const storeRef = useRef<CourseStoreApi>(null);
  const { updateTheme } = useContext(themeContext);

  if (!storeRef.current) {
    storeRef.current = createCourseStore(initState);
  }

  updateTheme(initState.course.config);

  return (
    <CourseStoreContext.Provider value={storeRef.current}>
      {children}
    </CourseStoreContext.Provider>
  );
};

export const useCourseStore = <T,>(selector: (store: CourseStore) => T): T => {
  const counterStoreContext = useContext(CourseStoreContext);

  if (!counterStoreContext) {
    throw new Error(`useCourseStore must be used within CounterStoreProvider`);
  }

  return useStore(counterStoreContext, selector);
};
