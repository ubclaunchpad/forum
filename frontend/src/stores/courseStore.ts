// import {  coursePartialUpdateSchema } from "@/lib/types/course";
import { Course, GetDocument, MutatePostArguments, Post } from "@forum/shared";
import { Tag } from "@/lib/types/tags";
import { createStore } from "zustand";
import { persist } from "zustand/middleware";
import { createJSONStorage } from "zustand/middleware";

export type CourseState = {
  course: Course;
  pendingCourse: Course;
  posts: Post[];
  tags: Tag[];
  documents: GetDocument[];
  postDraft: MutatePostArguments | null;
};

export type CourseActions = {
  updatePendingCourse: (courseDetails: Partial<Course>) => void;
  saveCourseChanges: () => boolean;
  resetPendingChanges: () => void;
  addTag: (tag: Tag) => void;
  setPosts: (posts: Post[]) => void;
  setDocuments: (documents: GetDocument[]) => void;
  setPostDraft: (postDraft: MutatePostArguments | null) => void;
};

export type CourseStore = CourseState & CourseActions;

export const createCourseStore = (initState: CourseState) => {
  return createStore<CourseStore>()(
    persist(
      (set) => ({
        ...initState,
        setPosts: (posts: Post[]) => set({ posts }),
        setDocuments: (documents: GetDocument[]) => set({ documents }),
        setPostDraft: (postDraft: MutatePostArguments | null) =>
          set({ postDraft }),
        pendingCourse: initState.course,
        updatePendingCourse: (courseDetails: Partial<Course>) =>
          set((state) => {
            // // const result = coursePartialUpdateSchema.safeParse(courseDetails);

            // if (!result.success) {
            //   console.error("Invalid course update:", result.error);
            //   return { pendingCourse: state.pendingCourse };
            // }

            return {
              // pendingCourse: { ...state.pendingCourse, ...result.data },
            };
          }),
        resetPendingChanges: () =>
          set((state) => ({
            pendingCourse: { ...state.course },
          })),
        saveCourseChanges: () => {
          set((state) => ({
            course: state.pendingCourse,
          }));
          return true;
        },
        addTag: (tag: Tag) =>
          set((state) => ({
            tags: [...state.tags, tag],
          })),
      }),
      {
        name: `courseStore-${initState.course.id}`,
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
  );
};
