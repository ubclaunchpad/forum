"use client";
import IconFetcher from "@/lib/iconFetcher";
import { HighlightedText } from "@/lib/utility/highlighter";
import AiLoader from "./ai-loader";
import AnimatedMarkdown from "../general/AnimatedMarkdown";
import { useEffect, useRef } from "react";
import { ArrowRightCircleIcon } from "lucide-react";
import { MessageBubbleIcon } from "../customIcons/message-bubble-icon";
import { SourceIcon } from "../customIcons/source-icon";
import { useRouter } from "next/navigation";
import { useSearchStore } from "@/providers/searchStoreProvider";
import { cn } from "@/lib/utils";
import { useCourseStore } from "@/providers/courseStoreProvider";
import { getLink } from "./searchHelper";



export function SearchContent() {
  const searchStore = useSearchStore((state) => state);
  if (searchStore.searchType === "ai") {
    return (
      <AISearchContent />
    );
  } else {
    return (
      <TextSearchContent />
    );
  }
}

function AISearchContent() {
    const course = useCourseStore((state) => state.course);
  const searchStore = useSearchStore((state) => state);
  const followUpRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (followUpRef.current) {
      followUpRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [searchStore.thread]);


  if (searchStore.loadingState === "loading ai") {
    return <AiLoader />;
  }
  if (searchStore.thread.length === 0) {
    return (
      <div className="flex flex-col font-medium justify-center items-center px-4 w-full gap-4 min-h-[300px]">
        <h1>No results found</h1>
      </div>
    );
  }
  return (
    <div className="flex flex-col px-10 overflow-y-scroll w-full gap-4 py-4">
      {searchStore.thread.map((t, index) => (
        <div key={index} className="flex flex-col gap-2">
          <h3 className="text-neutral-800 capitalize font-semibold text-xl">
            {t.question} <span className="text-neutral-600 text-xs">({t.thread_id})</span>
          </h3>
          <div className="flex flex-col gap-2 py-4">
            <h4 className="text-neutral-800 font-semibold text-lg flex flex-row gap-2 items-center">
              <SourceIcon />
              Sources
            </h4>
            <div className="flex flex-row overflow-x-auto gap-3 py-4">
              {t.sources.map((s, index) => (
                <button
                  className="text-primary-600 text-neutral-800 p-4 overflow-hidden w-52 max-h-32 bg-neutral-0 shadow-sm flex flex-col flex-shrink-0 border rounded-3xl border-primary-100 hover:bg-primary-50 hover:border-primary-200 hover:shadow-md transition-all duration-300"
                  key={index}
                  onClick={() => {
                    if (s.entity_type === "document") {
                      const id = s.entity_id;
                      router.push(
                        getLink(s.entity_type, id, course.id),
                        {
                          scroll: false,
                        }
                      );
                      searchStore.setIsOpen(false)

                    } else {
                    alert("Post redirect not implemented yet")
                    }
                  }}
                >
                  <p className="text-neutral-800 text-sm line-clamp-3">
                    {s.content.slice(0, 100)}...
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 pb-4">
            <h4 className="text-neutral-800 font-semibold text-lg flex flex-row gap-2 items-center">
              <MessageBubbleIcon />
              Answer
            </h4>
            <div className="p-2 text-neutral-800 prose max-w-none">
              <AnimatedMarkdown content={t.answer} />
            </div>
          </div>
        </div>
      ))}

      {searchStore.loadingState === "loading followup" ? <AiLoader /> : <></>}

      <div className={cn("flex fixed bottom-0 max-w-xl  w-full justify-center left-1/2 -translate-x-1/2 items-center transition-all duration-1000", searchStore.loadingState !== "idle" ? "opacity-0" : "opacity-100")}>
        <div className="flex flex-col relative gap-2 max-w-xl  w-full py-4">
          <input
            ref={followUpRef}
            type="text"
            className="w-full border rounded-full shadow-sm px-8 border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:ring-offset-2 transition-all duration-300 p-2 "
            placeholder="Ask a follow up question"
            value={searchStore.followUpQuestion}
            onChange={(e) => searchStore.setFollowUpQuestion(e.target.value)}
          />
          <button
            className="text-primary-600 text-neutral-0 px-4 py-2 rounded-full absolute right-0"
            onClick={() => searchStore.executeSearch("followup")}
          >
            <ArrowRightCircleIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

function TextSearchContent() {
  const searchStore = useSearchStore((state) => state);
  const textSearchResponse = searchStore.textSearchResponse;
  const course = useCourseStore((state) => state.course);
  const router = useRouter();
  if (!textSearchResponse) {
    return <></>;
  }
  if (!textSearchResponse.results || textSearchResponse.results.length === 0) {
    return (
      <div className="flex flex-col font-medium justify-center items-center px-4 w-full gap-4 min-h-[300px]">
        <h1>No results found</h1>
      </div>
    );
  }
  return (
    <div className="flex flex-col pb-10 overflow-y-scroll px-2 w-full gap-4 min-h-[300px]">
      <div className="flex flex-col  gap-2 w-full">
        {textSearchResponse.results.map((result, index) => (
          <button
            className="flex  border rounded-xl shadow-sm border-neutral-200  p-2 gap-4 hover:bg-primary-100 hover:shadow-md hover:border-primary-200 transition-all duration-300"
            key={index}
            
            onClick={() => {
                if (result.entity_type === "document") {
                  const id = result.entity_id;
                  router.push(
                    getLink(result.entity_type, id, course.id),
                    {
                      scroll: false,
                    }
                  );
                  searchStore.setIsOpen(false)
                } else {
                alert("Post redirect not implemented yet")
                }
              }}
              >

            <div className="flex flex-col w-full items-center gap-2">
              <div className="flex w-full items-center gap-2">
              <IconFetcher
                type={result.type}
                className="h-8 w-8 text-primary-600"
              />
                <p className="text-sm text-primary-600 font-semibold">
                  {result.title}
                </p>
              </div>
              <div className="text-sm w-full justify-start text-left items-start px-1 text-neutral-600 line-clamp-5  overflow-hidden">
                <HighlightedText
                  content={result.content}
                  wordsToHighlight={searchStore.search}
                />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
