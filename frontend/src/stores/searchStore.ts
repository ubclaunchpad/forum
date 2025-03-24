import { createStore, StoreApi, UseBoundStore } from "zustand";
import { createJSONStorage, persist, PersistOptions } from "zustand/middleware";

export type SearchState = {
    search: string;
    searchType: "text" | "ai";
    loadingState:
        | "idle"
        | "loading text"
        | "loading ai"
        | "loading followup"
        | "generating response";
    isOpen: boolean;
    textSearchResponse: {
        results: Source<SourceType>[];
    };
    followUpQuestion: string;
    response: any;
    thread: {
        thread_id: string;
        question: string;
        answer: string;
        sources: AISource<SourceType>[];
    }[];
};

type SourceType = "document" | "post";

// Base metadata for all source types
interface BaseMetadata {
    created_at: string;
    updated_at: string;
}

// Document-specific metadata
interface DocumentMetadata extends BaseMetadata {
    page_number: number;
}

// Post-specific metadata
interface PostMetadata extends BaseMetadata {
    // Add post-specific metadata fields here if needed
}

// Conditional metadata type based on source type
type SourceMetadata<T extends SourceType> = T extends "document"
    ? DocumentMetadata
    : T extends "post" ? PostMetadata
    : BaseMetadata;

export type Source<T extends SourceType> = {
    entity_type: T;
    entity_id: string;
    content: string;
    course_id: string;
    metadata: SourceMetadata<T>;
    title?: string;
    type?: string;
};

export type AISource<T extends SourceType> = Source<T> & {
    similarity: number;
};

export type SearchActions = {
    setSearchQuery: (searchQuery: string) => void;
    changeSearchType: (searchType: "text" | "ai") => void;
    setLoadingState: (
        loadingState:
            | "idle"
            | "loading text"
            | "loading ai"
            | "loading followup"
            | "generating response",
    ) => void;
    setIsOpen: (isOpen: boolean) => void;
    addToThread: ({
        question,
        answer,
        sources,
        thread_id,
    }: {
        question: string;
        answer: string;
        sources: AISource<SourceType>[];
        thread_id: string;
    }) => void;
    clearThread: () => void;
    reset: () => void;
    executeSearch: (variant: "text" | "ai" | "followup") => void;
    setFollowUpQuestion: (followUpQuestion: string) => void;
};

export type SearchStore = SearchState & SearchActions;

// Define a proper ZustandSetState type without using 'any'
export type SetState<T> = (
    nextStateOrUpdater: T | Partial<T> | ((state: T) => T | Partial<T>),
    shouldReplace?: boolean,
) => void;

// Define proper persist options type
type SearchPersistOptions = PersistOptions<SearchStore, SearchState>;

export const createSearchStore = (
    initActions: (set: SetState<SearchState>) => SearchActions,
) => {
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

    // Create the store with proper type definitions
    return createStore<SearchStore>()(
        persist(
            (set) => ({
                ...initState,
                ...initActions(set as SetState<SearchState>),
            }),
            {
                name: "searchStore",
                storage: createJSONStorage(() => sessionStorage),
            } as SearchPersistOptions,
        ),
    );
};
