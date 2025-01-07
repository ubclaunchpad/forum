"use client";
import {
  ExternalLinkIcon,
  ListOrderedIcon,
  SearchIcon,
  XIcon,
  FileTextIcon,
  MessageSquareIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { useContext, useState } from "react";
import { courseContext } from "@/contexts/courseContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Input } from "../ui/input";
import Link from "next/link";
import { userContext } from "@/contexts/userContext";
import useDocumentQuery from "@/hooks/useDocumentQuery";
import EditorComponent from "../general/EditorComponent";

const MIN_SEARCH_LENGTH = 5;
const MAX_SEARCH_LENGTH = 1000;

const SourceIcon = ({ type }) => {
  if (type === "pdf") return <FileTextIcon className="w-4 h-4" />;
  if (type === "post") return <MessageSquareIcon className="w-4 h-4" />;
  return <ExternalLinkIcon className="w-4 h-4" />;
};

const SourceLink = ({ source }) => {
  const linkProps = {
    className:
      "flex items-center gap-2 border rounded-full bg-neutral-200 p-1 px-4 no-underline text-primary-800",
    target: source.fe_type === "pdf" ? "_blank" : undefined,
    referrerPolicy: source.fe_type === "pdf" ? "no-referrer" : undefined,
  };

  if (source.fe_type === "pdf") {
    return (
      <Link
        {...linkProps}
        href={`https://docs.google.com/viewer?url=${encodeURIComponent(source.url)}`}
      >
        <SourceIcon type={source.fe_type} />
        {source.title}
      </Link>
    );
  }

  return (
    <Link {...linkProps} href={source.url}>
      <SourceIcon type={source.fe_type} />
      {source.title}
    </Link>
  );
};

const SourceMetadata = ({ source }) => {
  if (source.fe_type === "pdf" && source.metadata?.page_number) {
    return (
      <span className="text-sm text-neutral-500">
        Page {source.metadata.page_number}
      </span>
    );
  }
  return null;
};

export function Searchbar() {
  const { token } = useContext(userContext);
  const course = useContext(courseContext);
  const [search, setSearch] = useState("");

  const { queryDocuments, response, isLoading } = useDocumentQuery({
    courseId: course.info.id as string,
    token,
  });

  const handleSearch = () => {
    if (
      search.length < MIN_SEARCH_LENGTH ||
      search.length > MAX_SEARCH_LENGTH
    ) {
      return;
    }
    queryDocuments(search);
  };

  return (
    <>
      <Button
        variant="ghost"
        className="flex items-center rounded-full bg-white max-w-md px-2 w-full min-w-[500px] border overflow-hidden absolute left-1/2 transform h-10 -translate-x-1/2"
        onClick={() => {
          window.dialog.showModal();
        }}
      >
        <SearchIcon className="mr-2" />
        Search documents and posts...
      </Button>

      <dialog className="bg-transparent top-0" id="dialog">
        <section
          className={`top-10 left-0 flex flex-col max-w-4xl gap-2 w-full  min-w-[1000px] flex-shrink-0  max-h-[90dvh] overflow-hidden bg-white border-neutral-100 ${
            response || isLoading ? "rounded-lg rounded-t-3xl" : "rounded-full"
          }`}
        >
          <div className="flex justify-center gap-1 items-center p-2">
            <Button
              variant="ghost"
              className="rounded-full h-10 w-10 flex-shrink-0 border p-0 border-neutral-200"
              onClick={() => {
                window.dialog.close();
              }}
            >
              <XIcon />
            </Button>
            <Input
              value={search}
              disabled={isLoading}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Write a few words to search..."
              className="px-2 h-10 text-base rounded-full border-neutral-200 bg-white border focus:outline-none focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Button
              className="w-10 p-0 rounded-full flex-shrink-0 h-10"
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

          {isLoading && !response && (
            <div className="flex flex-col px-4 w-full gap-4 min-h-[300px]">
              <div className="loading-bar"></div>
              <div className="loading-bar max-w-sm"></div>
            </div>
          )}

          {response && (
            <article className="pt-0 px-4 roundex-xl h-full pb-4 w-full min-h-1 flex flex-col gap-4 overflow-y-scroll">
              <div className="flex flex-col w-full rounded-2xl justify-center items-center bg-primary-500 bg-opacity-10 border border-neutral-200 py-4 pb-0">
                <div className="p-2 text-primary-800 prose max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {response.answer}
                  </ReactMarkdown>
                </div>

                <details className="flex flex-col w-full border border-t rounded-lg py-2 px-2 bg-neutral-50 bg-opacity-80 rounded-t-3xl rounded-b-2xl">
                  <summary className="flex items-center justify-between p-3 w-full cursor-pointer rounded-full border-netural-200 hover:bg-neutral-200/50 transition-colors">
                    <h2 className="text-lg text-neutral-900 flex gap-2 items-center font-semibold">
                      <ListOrderedIcon className="w-7 h-7" />
                      Sources
                    </h2>
                    <p className="text-sm">
                      Found {response.sources.length} results
                    </p>
                  </summary>

                  <div className="flex flex-col pt-4 gap-2">
                    {response.sources.map((source, index) => (
                      <details
                        key={index}
                        className="group border bg-neutral-100 border-neutral-200 gap-2 rounded-lg"
                      >
                        <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-neutral-200/50 transition-colors">
                          <div className="flex items-center gap-2">
                            <SourceLink source={source} />
                            <SourceMetadata source={source} />
                          </div>
                          <span className="text-sm text-neutral-500">
                            Relevance: {(source.similarity * 100).toFixed(1)}%
                          </span>
                        </summary>
                        <div className="p-3 border-t border-neutral-200 bg-neutral-50">
                          <div className="whitespace-pre-wrap prose max-w-none">
                            <EditorComponent
                              editable={false}
                              markdown={source.content}
                              onMarkdownChange={() => {}}
                            />
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
