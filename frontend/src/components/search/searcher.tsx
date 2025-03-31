"use client";
import { ArrowRightIcon, SearchIcon, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useDebounce } from "@/hooks/use-debounce";
import { SEARCH_PARAMS } from "./searchParams";
import { SearchContent } from "./search-content";
import { Input } from "../ui/input";
import { useSearchStore } from "@/providers/searchStoreProvider";

export function Searcher() {
  // const isDesktop = useMediaQuery("(min-width: 1000px)");
  const searchBarRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchStore = useSearchStore((state) => state);
  // const debouncedSearch = useDebounce(searchStore.search, 500);
  const isSearchEmpty = searchStore.search === "";
  const debouncedIsEmpty = useDebounce(isSearchEmpty, 2000);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle keyboard shortcut for opening the search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchStore.setIsOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Function to check if user has stopped typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    searchStore.setSearchQuery(newValue);

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set a new timeout to detect when user stops typing
    typingTimeoutRef.current = setTimeout(() => {
      // Only execute search if there's actual content and not already in AI mode
      if (newValue && searchStore.searchType !== "ai") {
        searchStore.executeSearch("text");
      }
    }, 600); // Wait 600ms after user stops typing
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Reset search state when search is empty for 2 seconds
  useEffect(() => {
    if (debouncedIsEmpty && searchStore.isOpen) {
      searchStore.reset();
    }
  }, [debouncedIsEmpty, searchStore.isOpen]);

  const handleClose = () => {
    searchStore.setIsOpen(false);
  };

  const SearchContentSection = (
    <>
      <div
        className="flex justify-center gap-1 h-16 shrink-0 border-b border-neutral-200 items-center w-full p-2 py-4"
        // onKeyDown={listenForEnter}
      >
        <Button
          variant="ghost"
          className="rounded-full h-10 w-10 shrink-0 border p-0 border-neutral-200"
          onClick={handleClose}
        >
          <XIcon />
        </Button>
        <Input
          id="search-input"
          ref={searchInputRef}
          value={searchStore.search}
          // disabled={searchStore.loadingState !== "idle"}
          onChange={handleInputChange}
          type="text"
          placeholder="Write a few words to search..."
          className="px-2 h-10 text-base rounded-full border-neutral-200 bg-white border focus:outline-hidden focus:border-primary focus:ring-3 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <Button
          className="w-fit p-0 px-4 rounded-full border border-primary-700 shrink-0 h-10"
          variant="default"
          disabled={
            searchStore.loadingState !== "idle" ||
            searchStore.search.length < SEARCH_PARAMS.MIN_SEARCH_LENGTH ||
            searchStore.search.length > SEARCH_PARAMS.MAX_SEARCH_LENGTH
          }
          onClick={() => searchStore.executeSearch("ai")}
        >
          Ask AI <ArrowRightIcon className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-col gap-2 overflow-y-hidden">
        <SearchContent />
      </div>
    </>
  );

  const searchPreview = useMemo(() => {
    if (searchStore.isOpen) {
      return "Search documents and posts...";
    }
    if (searchStore.search.length > 0 && searchStore.searchType === "text") {
      return `Search for "${searchStore.search}"`;
    } else if (
      searchStore.search.length > 0 &&
      searchStore.searchType === "ai"
    ) {
      return (
        "Continue conversation " +
        (searchStore.thread[searchStore.thread.length - 1]?.question ?? "")
      );
    } else {
      return "Search documents and posts...";
    }
  }, [
    searchStore.search,
    searchStore.searchType,
    searchStore.thread,
    searchStore.isOpen,
  ]);

  const desktopSearchUI = (
    <Dialog open={searchStore.isOpen} onOpenChange={searchStore.setIsOpen}>
      <DialogTrigger className="flex-1" asChild>
        <Button
          ref={searchBarRef}
          variant="default"
          className="flex w-10 hover:bg-neutral-100 border-primary-border shadow-xs shrink-0 items-center font-medium text-neutral-600 rounded-full px-1 bg-white max-w-full lg:max-w-md min-w-0 lg:min-w-[500px] lg:w-full border overflow-hidden lg:absolute lg:left-1/2 lg:transform h-10 lg:-translate-x-1/2"
          onClick={() => {
            searchStore.setIsOpen(true);
          }}
        >
          <span className="relative flex w-full justify-center md:justify-end">
            <span className="hidden lg:block lg:absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm">
              {searchPreview}
            </span>
            <SearchIcon className="md:mr-2 font-normal max-w-4 max-h-4" />
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent
        position="tc"
        showClose={false}
        className="flex flex-1 overflow-hidden course flex-col max-w-4xl gap-2 w-full min-w-[90dvw] xl:min-w-[1000px] shrink-0 h-[calc(100dvh-1.5rem)]  overflow-hidden bg-white border-neutral-100 sm:rounded-3xl p-0"
        style={{
          top: searchBarRef.current?.offsetTop,
        }}
      >
        {SearchContentSection}
        <DialogHeader className="hidden">
          <DialogTitle>Search Documents and Posts</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );

  const mobileSearchUI = (
    <Drawer open={searchStore.isOpen} onOpenChange={searchStore.setIsOpen}>
      <DrawerContent className="h-[calc(90dvh-1.5rem)] course max-h-[calc(90dvh-1.5rem)] overflow-hidden">
        <DrawerHeader className="p-0"></DrawerHeader>
        {SearchContentSection}
      </DrawerContent>
    </Drawer>
  );

  // if (isDesktop) {
  //   return desktopSearchUI;
  // } else {
  //   return mobileSearchUI;
  // }

  return desktopSearchUI;
}
