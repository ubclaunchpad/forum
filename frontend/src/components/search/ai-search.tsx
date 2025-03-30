"use client";
import {
  ExternalLinkIcon,
  SearchIcon,
  XIcon,
  FileTextIcon,
  MessageSquareIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { useContext, useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { userContext } from "@/providers/userContext";
import { useCourseStore } from "@/providers/courseStoreProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import AnimatedMarkdown from "../general/AnimatedMarkdown";
import { getApiUrl } from "@/utils/helpers";
import IconFetcher from "@/lib/iconFetcher";
import { useDebounce } from "@/hooks/use-debounce";
import AiLoader from "../search/ai-loader";
import { HighlightedText } from "@/lib/utility/highlighter";

interface SearchResponse {
  text: string;
  sources: any[];
  result: string;
}

interface SearchContentProps {
  search: string;
  setSearch: (search: string) => void;
  isLoading: boolean;
  handleSearch: () => void;
  handleTextSearch: () => void;
  response: SearchResponse | null;
  textSearchResponse: { results: any[] } | null;
  onClose: () => void;
}

interface SourceIconProps {
  type: string;
}

const MIN_SEARCH_LENGTH = 5;
const MAX_SEARCH_LENGTH = 1000;

const SearchContent: React.FC<SearchContentProps> = ({
  search,
  setSearch,
  isLoading,
  handleSearch,
  handleTextSearch,
  response,
  onClose,
  textSearchResponse,
}) => {
  function listenForEnter(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
    }

    if (isLoading || !search) return;
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <>
      <div
        className="flex justify-center gap-1 items-center w-full p-2"
        onKeyDown={listenForEnter}
      >
        <Button
          variant="ghost"
          className="rounded-full h-10 w-10 shrink-0 border p-0 border-neutral-200"
          onClick={onClose}
        >
          <XIcon />
        </Button>
        <Input
          id="search-input"
          value={search}
          disabled={isLoading}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          type="text"
          placeholder="Write a few words to search..."
          className="px-2 h-10 text-base rounded-full border-neutral-200 bg-white border focus:outline-hidden focus:border-primary focus:ring-3 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <Button
          className="w-10 p-0 rounded-full shrink-0 h-10"
          variant="solid"
          disabled={
            isLoading ||
            search.length < MIN_SEARCH_LENGTH ||
            search.length > MAX_SEARCH_LENGTH
          }
          onClick={handleTextSearch}
        >
          Text Search
        </Button>
        <Button
          className="w-10 p-0 rounded-full shrink-0 h-10"
          variant="solid"
          disabled={
            isLoading ||
            search.length < MIN_SEARCH_LENGTH ||
            search.length > MAX_SEARCH_LENGTH
          }
          onClick={handleSearch}
        >
          <SearchIcon />
        </Button>
      </div>

      {isLoading && !response && <AiLoader />}

      {textSearchResponse && (
        <div className="flex flex-col px-4 w-full gap-4 min-h-[300px]">
          <div className="flex flex-col p-2 gap-2 w-full">
            {textSearchResponse.results.map((result, index) => (
              <div
                className="flex flex-col border-b border-neutral-200  p-2 gap-2"
                key={index}
              >
                <div className="flex w-full items-center gap-2">
                  <IconFetcher type={result.type} />

                  <span className="text-sm text-neutral-500">
                    {result.title}
                  </span>
                </div>
                <div className="text-sm text-neutral-500 line-clamp-2 max-h-[100px] overflow-hidden">
                  <HighlightedText
                    content={result.content}
                    wordsToHighlight={search}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {response && (
        <article className="pt-0 px-4 roundex-xl h-full pb-4 w-full min-h-1 flex flex-col gap-4 overflow-y-auto">
          <div className="flex flex-col w-full rounded-2xl justify-center items-center border-none py-4 pb-0">
            {/* {response.checkpoint && (
              <div className="w-full flex pl-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <span className="font-medium">
                    {response.checkpoint.label}
                  </span>
                  {response.checkpoint.expanded && (
                    <span className="text-neutral-500">
                      - {response.checkpoint.expanded}
                    </span>
                  )}
                </div>
              </div>
            )} */}
            {response.result && (
              <div className="p-2 text-primary-800 prose max-w-none">
                <AnimatedMarkdown content={response.result} />
              </div>
            )}
            {/* 
            {response.sources.length > 0 && (
              <div className="flex flex-col gap-2 w-full">
                {response.sources.map((source, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedSource(source);
                      setSheetOpen(true);
                    }}
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <SourceLink source={source} />
                      <SourceMetadata source={source} />
                    </div>
                    <span className="text-sm text-neutral-500">
                      {
                        CONFIDENCE_RANGES.find(
                          (range) =>
                            source.similarity >= range.min &&
                            source.similarity <= range.max,
                        )?.label
                      }
                    </span>
                  </div>
                ))}
              </div>
            )} */}
          </div>
        </article>
      )}
    </>
  );
};
