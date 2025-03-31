"use client";
import IconFetcher from "@/lib/iconFetcher";
import { HighlightedText } from "@/lib/utility/highlighter";
import AiLoader from "./ai-loader";
import AnimatedMarkdown from "../general/AnimatedMarkdown";
import { useContext, useEffect, useRef } from "react";
import { ArrowRightCircleIcon, TrendingUpIcon } from "lucide-react";
import { MessageBubbleIcon } from "../customIcons/message-bubble-icon";
import { SourceIcon } from "../customIcons/source-icon";
import { useRouter } from "next/navigation";
import { useSearchStore } from "@/providers/searchStoreProvider";
import { cn, getRelativeTimeString } from "@/lib/utils";
import { useCourseStore } from "@/providers/courseStoreProvider";
import { getLink } from "./searchHelper";
import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/utils/helpers";
import { userContext } from "@/providers/userContext";
import type { AnalyticsOutput } from "@forum/shared";

export function SearchContent() {
  const searchStore = useSearchStore((state) => state);
  const content =
    searchStore.searchType === "ai" ? (
      <AISearchContent />
    ) : (
      <TextSearchContent />
    );
  return (
    <>
      <div className="flex flex-col gap-2 overflow-y-hidden">
        <div className="flex flex-row gap-2 items-center font-medium font-italic text-neutral-600 capitalize text-sm justify-end px-8 w-full">
          {searchStore.loadingState}
        </div>
        {content}
      </div>
    </>
  );
}

function AISearchContent() {
  const course = useCourseStore((state) => state.course);
  const searchStore = useSearchStore((state) => state);
  const followUpRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  if (searchStore.loadingState === "loading ai") {
    return <AiLoader />;
  }

  if (searchStore.thread.length === 0) {
    return (
      <div className="flex flex-col font-medium justify-center items-center px-4 w-full gap-4 min-h-[300px]">
        <h1></h1>
      </div>
    );
  }

  useEffect(() => {
    if (followUpRef.current) {
      followUpRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [searchStore.thread.length, searchStore.loadingState]);

  return (
    <div className="flex flex-col px-10 overflow-y-scroll w-full gap-4 py-4">
      {searchStore.thread.map((t, index) => (
        <div key={index} className="flex flex-col gap-2">
          <h3 className="text-neutral-800 capitalize font-semibold line-clamp-1 truncate text-xl">
            {t.question}{" "}
            {/* <span className="text-neutral-600 text-xs">({t.thread_id})</span> */}
          </h3>
          <div className="flex flex-col gap-2 py-4">
            <h4 className="text-neutral-800 font-semibold text-lg flex flex-row gap-2 items-center">
              <SourceIcon />
              Sources
            </h4>
            <div className="flex flex-row overflow-x-auto gap-3 py-4 on-appear-animation ">
              {t.sources.map((s, index) => (
                <button
                  className="text-primary-600  p-4 overflow-hidden w-52 max-h-32 bg-neutral-0 shadow-xs flex flex-col shrink-0 border rounded-3xl border-primary-100 hover:bg-primary-50 hover:border-primary-200 hover:shadow-md transition-all duration-300"
                  key={index}
                  onClick={() => {
                    if (s.entity_type === "document") {
                      const id = s.entity_id;
                      router.push(getLink(s.entity_type, id, course.id), {
                        scroll: false,
                      });
                      searchStore.setIsOpen(false);
                    } else {
                      const id = s.entity_id;
                      router.push(getLink(s.entity_type, id, course.id), {
                        scroll: false,
                      });
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
              <span
                className={`${index === searchStore.thread.length - 1 && searchStore.loadingState !== "idle" ? "animate-pulse  " : ""}`}
              >
                <MessageBubbleIcon />
              </span>
              Answer
            </h4>
            <div className="p-2 text-neutral-800 prose max-w-none">
              <AnimatedMarkdown content={t.answer} />
            </div>
          </div>
        </div>
      ))}

      {searchStore.loadingState === "loading followup" ? <AiLoader /> : <></>}

      <div
        className={cn(
          "flex  max-w-xl  w-full justify-center  items-center transition-all ",
          searchStore.loadingState !== "idle" ? "opacity-0" : "opacity-100",
        )}
      >
        <div className="flex flex-col relative gap-2 max-w-xl  w-full py-4">
          <input
            ref={followUpRef}
            type="text"
            className="w-full bg-white border rounded-full shadow-xs px-8 border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-primary-200 focus:ring-offset-2 transition-all duration-300 p-2 "
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
  const { profile, token } = useContext(userContext);
  const { isPending, error, data } = useQuery({
    queryKey: [`${course.id}_user_threads`, searchStore.search],
    queryFn: () =>
      fetch(
        `${getApiUrl()}/search/threads/user/${profile?.id}?course_id=${course.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      ).then((res) => res.json()),
  });

  const { data: analyticsData } = useQuery<{
    insights: AnalyticsOutput;
  }>({
    queryKey: [`${course.id}_analytics`],
    queryFn: () =>
      fetch(`${getApiUrl()}/analytics/course/${course.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json()),
  });

  const router = useRouter();
  if (!textSearchResponse) {
    return <></>;
  }
  if (!searchStore.search) {
    return (
      <div className="flex flex-col font-medium justify-center items-center px-4 w-full gap-10 py-2">
        <div className="flex flex-col w-full px-4 gap-4">
          <h3 className="text-neutral-800 font-semibold text-lg">
            Popular Searches
          </h3>
          {analyticsData &&
          analyticsData.insights.aiInsights.popularQuestions.length > 0 ? (
            analyticsData.insights.aiInsights.popularQuestions.map(
              (q: any, index: number) => (
                <div key={index} className="flex flex-row gap-2 items-center">
                  <TrendingUpIcon className="w-6 h-6 text-primary-600" />
                  <p className="text-neutral-600 ">{q.question}</p>
                  <p className="text-neutral-600 text-sm"></p>
                </div>
              ),
            )
          ) : (
            <p className="text-neutral-600 text-sm">
              No popular questions found
            </p>
          )}
        </div>

        <div className="flex flex-col w-full px-4 gap-4">
          <h3 className="text-neutral-800 font-semibold text-lg">
            Your Conversations
          </h3>
          {data && data.threads.length > 0 ? (
            data?.threads.map((t: any, index: number) => (
              <button key={index} className="flex flex-row gap-2 items-center">
                <h4 className="shrink-0 flex flex-row gap-2 items-center">
                  <MessageBubbleIcon />
                  {t.name}
                </h4>
                <div className="flex flex-1 justify-end flex-row gap-2 items-center">
                  <p className="text-neutral-600 text-sm">
                    {`Created ${getRelativeTimeString(
                      new Date(t.created_at).getTime(),
                      "en",
                      14,
                    )}`}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <h1>No threads found</h1>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col pb-10 overflow-y-scroll px-2 w-full gap-4 min-h-[300px]">
      <div className="flex flex-col  gap-2 w-full">
        {textSearchResponse.results?.map((result, index) => (
          <button
            className="flex  border rounded-xl shadow-xs border-neutral-200  p-2 gap-4 hover:bg-primary-100 hover:shadow-md hover:border-primary-200 transition-all duration-300"
            key={index}
            onClick={() => {
              if (
                result.entity_type === "document" ||
                result.entity_type === "post"
              ) {
                const id = result.entity_id;
                router.push(getLink(result.entity_type, id, course.id), {
                  scroll: false,
                });
                searchStore.setIsOpen(false);
              } else {
                alert("Post redirect not implemented yet");
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
