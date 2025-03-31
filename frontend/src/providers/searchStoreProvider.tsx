"use client";

import {
  createSearchStore,
  SearchStore,
  SearchState,
  SearchActions,
  SetState,
} from "@/stores/searchStore";
import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";
import { useCourseStore } from "./courseStoreProvider";
import { userContext } from "./userContext";
import { getApiUrl } from "@/utils/helpers";

export type SearchStoreApi = ReturnType<typeof createSearchStore>;

export const SearchStoreContext = createContext<SearchStoreApi | undefined>(
  undefined,
);

export interface SearchStoreProviderProps {
  children: ReactNode;
}

export const SearchStoreProvider = ({ children }: SearchStoreProviderProps) => {
  const storeRef = useRef<SearchStoreApi>(null);
  const { token } = useContext(userContext);
  const course = useCourseStore((state) => state.course);

  const initState: SearchState = {
    search: "",
    searchType: "text",
    loadingState: "idle",
    isOpen: false,
    textSearchResponse: {
      results: [],
    },
    followUpQuestion: "",
    response: null,
    thread: [],
  };

  async function executeAISearch(
    state: SearchState,
    set: SetState<SearchState>,
    append: boolean = false,
    stream: boolean = true,
  ) {
    const query =
      state.followUpQuestion && append ? state.followUpQuestion : state.search;

    const threadId =
      state.thread.length > 0 && append ? state.thread[0].thread_id : null;

    if (!append) {
      set({
        loadingState: "loading ai",
        searchType: "ai",
        response: null,
        thread: [],
      });
    } else {
      set({
        loadingState: "loading followup",
        searchType: "ai",
        response: null,
      });
    }

    if (stream) {
      const response = await fetch(
        `${getApiUrl()}/search/courses/${course.id}/ask?stream=true`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ query, threadId }),
        },
      );

      const reader = response.body
        ?.pipeThrough(new TextDecoderStream())
        .getReader();
      if (!reader) {
        throw new Error("No reader found");
      }

      let answer = "";
      let buffer = "";

      set((state) => ({
        loadingState: "generating response",
      }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Add new chunk to buffer
        buffer += value || "";

        // Process complete lines in the buffer
        const lines = buffer.split("\n");
        // Keep the last line (potentially incomplete) in the buffer
        buffer = lines.pop() || "";

        // Process each complete line
        for (const line of lines) {
          if (!line.trim()) continue; // Skip empty lines

          try {
            // console.log("Processing line:", line);
            const text = JSON.parse(line);

            if (text.sources && text.question) {
              set((state) => {
                const pastThread = append ? state.thread : [];
                const newThreadMessage = {
                  answer: "",
                  sources: text.sources,
                  thread_id: text.thread_id,
                  question: text.question,
                };
                return {
                  thread: [...pastThread, newThreadMessage],
                };
              });
            } else if (text.text) {
              answer += text.text || "";
              set((state) => {
                const lastThreadMessage = state.thread[state.thread.length - 1];
                const newThreadMessage = {
                  ...lastThreadMessage,
                  answer: answer,
                };
                if (append) {
                  return {
                    thread: [...state.thread.slice(0, -1), newThreadMessage],
                  };
                } else {
                  return {
                    thread: [newThreadMessage],
                  };
                }
              });
            }
            if (text.checkPoint && text.checkPoint === "Done") {
              set({
                loadingState: "idle",
                searchType: "ai",
              });
            }
          } catch (e) {
            console.error("Error parsing JSON line:", e, "Line was:", line);
          }
        }
      }

      console.log("Closing ai search");
      set({
        loadingState: "idle",
        searchType: "ai",
      });
    } else {
    }
  }

  async function executeTextSearch(query: string, set: SetState<SearchState>) {
    set({
      loadingState: "loading text",
      searchType: "text",
    });
    try {
      const response = await fetch(
        `${getApiUrl()}/search/courses/${course.id}/textsearch?query=${query}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();

      set({
        textSearchResponse: data,
        loadingState: "idle",
        searchType: "text",
      });
    } catch (error) {
      console.error("Error during text search:", error);
    }
  }

  async function executeSearch(
    state: SearchState,
    variant: "text" | "ai" | "followup",
    set: SetState<SearchState>,
  ) {
    switch (variant) {
      case "text":
        await executeTextSearch(state.search, set);
        break;
      case "ai":
        await executeAISearch(state, set);
        break;
      case "followup":
        await executeAISearch(state, set, true);
        break;
    }
  }

  const initActions: (set: SetState<SearchState>) => SearchActions = (set) => ({
    setSearchQuery: (searchQuery: string) => set({ search: searchQuery }),
    changeSearchType: (searchType: "text" | "ai") => set({ searchType }),
    setLoadingState: (
      loadingState:
        | "idle"
        | "loading text"
        | "loading ai"
        | "loading followup"
        | "generating response",
    ) => set({ loadingState }),
    setIsOpen: (isOpen: boolean) => set({ isOpen }),
    addToThread: ({ question, answer, sources, thread_id }) =>
      set((state) => ({
        thread: [...state.thread, { question, answer, sources, thread_id }],
      })),
    clearThread: () => set({ thread: [] }),
    setFollowUpQuestion: (followUpQuestion: string) =>
      set({ followUpQuestion }),
    reset: () =>
      set((prev) => ({ ...prev, ...initState, isOpen: prev.isOpen })),
    executeSearch: (variant: "text" | "ai" | "followup") =>
      set((state) => {
        executeSearch(state, variant, set);
        return {};
      }),
  });

  if (!storeRef.current) {
    storeRef.current = createSearchStore(initActions, course.id);
  }

  return (
    <SearchStoreContext.Provider value={storeRef.current}>
      {children}
    </SearchStoreContext.Provider>
  );
};

export const useSearchStore = <T,>(selector: (store: SearchStore) => T): T => {
  const searchStoreContext = useContext(SearchStoreContext);

  if (!searchStoreContext) {
    throw new Error(`useSearchStore must be used within SearchStoreProvider`);
  }

  return useStore(searchStoreContext, selector as (state: SearchState) => T);
};
