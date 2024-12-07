"use client";

import { ExternalLinkIcon, ListOrderedIcon, SearchIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useContext, useState } from "react";
import { getApiUrl } from "@/utils/helpers";
import { courseContext } from "@/contexts/courseContext";
import { APIResponse } from "@/lib/types/query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Input } from "../ui/input";
import Link from "next/link";
import { userContext } from "@/contexts/userContext";

const MIN_SEARCH_LENGTH = 5;
const MAX_SEARCH_LENGTH = 1000;

export function Searchbar() {
  const { token } = useContext(userContext);
  const course = useContext(courseContext);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [response, setResponse] = useState<APIResponse | null>(null);

  async function sendSearchRequest() {
    if (
      search.length < MIN_SEARCH_LENGTH ||
      search.length > MAX_SEARCH_LENGTH
    ) {
      return;
    }
    setIsLoading(true);
    const res = await fetch(
      `${getApiUrl()}/courses/${course.info.id}/documents/query`,
      {
        method: "POST",
        body: JSON.stringify({
          question: search,
          template_name: "default.txt",
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await res.json();
    setResponse(data);
    setIsLoading(false);
  }

  return (
    <>
      <Button
        variant="ghost"
        className="flex items-center rounded-full max-w-md px-2 w-full min-w-[500px] border overflow-hidden absolute left-1/2 transform h-12 -translate-x-1/2"
        onClick={() => {
          window.dialog.showModal();
        }}
      >
        <SearchIcon className="mr-2" />
        Search documents...
      </Button>

      <dialog className="bg-transparent" id="dialog">
        <section
          className={`top-0 left-0 max-w-4xl gap-16 w-full min-w-[1000px] flex-shrink-0 max-h-[90dvh]  overflow-hidden bg-neutral-100 border-2 border-neutral-200 ${response ? "rounded-2xl" : "rounded-full"}`}
        >
          <div className="flex justify-between gap-2 items-center p-2">
            <Input
              value={search}
              disabled={isLoading}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search for something"
              className="px-2 h-12 text-base rounded-full border-neutral-200 border focus:outline-none focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Button
              className="px-4 py-2 rounded-full"
              variant="solid"
              disabled={
                isLoading ||
                search.length < MIN_SEARCH_LENGTH ||
                search.length > MAX_SEARCH_LENGTH
              }
              onClick={sendSearchRequest}
            >
              <SearchIcon />
            </Button>
          </div>

          {response && (
            <article
              className=" pt-0 px-4 roundex-xl h-full pb-4 w-full max-h-[600px]
             flex flex-col gap-4  overflow-y-scroll "
            >
              <div className="flex  flex-col w-full rounded-2xl  justify-center items-center bg-primary-500 bg-opacity-10 border  border-neutral-200 py-4 pb-0 ">
                <div className=" p-2   text-primary-800 prose max-w-none  ">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {response?.answer}
                  </ReactMarkdown>
                </div>
                <details className="flex flex-col w-full border border-t  rounded-lg py-2 px-2  bg-neutral-50 bg-opacity-80 rounded-t-3xl rounded-b-2xl ">
                  <summary className="flex items-center justify-between p-3 w-full cursor-pointer  rounded-full border-netural-200 hover:bg-neutral-200/50 transition-colors">
                    <h2 className="text-lg text-neutral-900 flex gap-2 items-center font-semibold">
                      <ListOrderedIcon className=" w-7 h-7" />
                      Sources
                    </h2>
                    <p className="text-sm ">
                      Found {response?.sources.length} results
                    </p>
                  </summary>
                  <div className="flex flex-col pt-4 gap-2">
                    {response?.sources.map((source) => (
                      <details
                        key={source.metadata.index}
                        className="group border bg-neutral-100 border-neutral-200  gap-2 rounded-lg"
                      >
                        <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-neutral-200/50 transition-colors">
                          <div className="flex items-center gap-2">
                            <Link
                              className="flex items-center gap-2 border rounded-full bg-neutral-200 p-1 px-4 no-underline text-primary-800"
                              href={`https://docs.google.com/viewer?url=${encodeURIComponent(source.signed_url)}`}
                              target="_blank"
                              referrerPolicy="no-referrer"
                            >
                              <ExternalLinkIcon className=" w-4 h-4" />
                              {source.title}
                            </Link>
                            <span className="text-sm text-neutral-500">
                              Page {source.metadata.page_number}
                            </span>
                          </div>
                          <span className="text-sm text-neutral-500">
                            Relevance: {(source.relevance * 100).toFixed(1)}%
                          </span>
                        </summary>
                        <div className="p-3 border-t border-neutral-200 bg-neutral-50">
                          <div className=" whitespace-pre-wrap prose max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {source.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </details>
              </div>
            </article>
          )}
        </section>
      </dialog>
    </>
  );
}
