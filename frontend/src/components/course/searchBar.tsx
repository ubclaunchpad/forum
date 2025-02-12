"use client";
import {
  ExternalLinkIcon,
  ListOrderedIcon,
  SearchIcon,
  XIcon,
  FileTextIcon,
  MessageSquareIcon,
  CommandIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  HTMLAttributeReferrerPolicy,
  useContext,
  useEffect,
  useState,
} from "react";
import { Input } from "../ui/input";
import Link from "next/link";
import { userContext } from "@/contexts/userContext";
import useDocumentQuery from "@/hooks/useDocumentQuery";
import { useCourseStore } from "@/providers/courseStoreProvider";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import AnimatedMarkdown from "../general/AnimatedMarkdown";

interface Source {
  fe_type: "pdf" | "post" | string;
  url: string;
  title: string;
  similarity: number;
  content: string;
  metadata?: {
    page_number?: number;
  };
}

interface SearchResponse {
  answer: string;
  sources: Source[];
}

interface SearchContentProps {
  search: string;
  setSearch: (search: string) => void;
  isLoading: boolean;
  handleSearch: () => void;
  response: SearchResponse | null;
  onClose: () => void;
}

interface SourceIconProps {
  type: string;
}

interface SourceLinkProps {
  source: Source;
}

interface SourceMetadataProps {
  source: Source;
}

const MIN_SEARCH_LENGTH = 5;
const MAX_SEARCH_LENGTH = 1000;

const SourceIcon: React.FC<SourceIconProps> = ({ type }) => {
  if (type === "pdf") return <FileTextIcon className="w-4 h-4" />;
  if (type === "post") return <MessageSquareIcon className="w-4 h-4" />;
  return <ExternalLinkIcon className="w-4 h-4" />;
};

const SourceLink: React.FC<SourceLinkProps> = ({ source }) => {
  const linkProps = {
    className:
      "flex items-center gap-2 border rounded-full bg-neutral-200 p-1 px-4 no-underline text-primary-800",
    target: source.fe_type === "pdf" ? "_blank" : undefined,
    referrerPolicy:
      source.fe_type === "pdf"
        ? ("no-referrer" as HTMLAttributeReferrerPolicy)
        : undefined,
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

const SourceMetadata: React.FC<SourceMetadataProps> = ({ source }) => {
  if (source.fe_type === "pdf" && source.metadata?.page_number) {
    return (
      <span className="text-sm text-neutral-500">
        Page {source.metadata.page_number}
      </span>
    );
  }
  return null;
};

const SearchContent: React.FC<SearchContentProps> = ({
  search,
  setSearch,
  isLoading,
  handleSearch,
  response,
  onClose,
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
          className="rounded-full h-10 w-10 flex-shrink-0 border p-0 border-neutral-200"
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
          <div className="flex gap-2">
            <div className="loading-bar max-w-sm"></div>
            <div className="loading-bar max-w-sm"></div>
          </div>
          <div className="loading-bar"></div>
          <div className="loading-bar max-w-sm"></div>
          <div className="loading-bar"></div>
          <div className="loading-bar max-w-sm"></div>
        </div>
      )}

      {response && (
        <article className="pt-0 px-4 roundex-xl h-full pb-4 w-full min-h-1 flex flex-col gap-4 overflow-y-auto">
          <div className="flex flex-col w-full rounded-2xl justify-center items-center border-none py-4 pb-0">
            <div className="p-2 text-primary-800 prose max-w-none">
              <AnimatedMarkdown content={response.answer} delay={30} />
            </div>

            <details className="flex flex-col w-full border border-t rounded-lg py-2 px-2 bg-neutral-50 bg-opacity-80 rounded-t-xl rounded-b-xl">
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
                        <AnimatedMarkdown
                          content={response.answer}
                          delay={30}
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
    </>
  );
};

export function Searchbar() {
  const { token } = useContext(userContext);
  const course = useCourseStore((state) => state.course);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1000px)");

  const { queryDocuments, response, isLoading } = useDocumentQuery({
    courseId: course.id,
    token,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        if (isDesktop) {
          window.dialog.showModal();
          const input = document.getElementById("search-input-dialog");
          input?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDesktop]);

  const handleSearch = () => {
    if (
      search.length < MIN_SEARCH_LENGTH ||
      search.length > MAX_SEARCH_LENGTH
    ) {
      return;
    }
    queryDocuments(search);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (isDesktop) {
      window.dialog.close();
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        className="flex w-10 items-center font-medium text-neutral-600 rounded-full px-1 bg-white max-w-full lg:max-w-md min-w-0 lg:min-w-[500px] lg:w-full border overflow-hidden lg:absolute lg:left-1/2 lg:transform h-10 lg:-translate-x-1/2"
        onClick={() => {
          setIsOpen(true);
          if (isDesktop) {
            window.dialog.showModal();
            const input = document.getElementById("search-input-dialog");
            input?.focus();
          }
        }}
      >
        <span className="relative flex w-full justify-center md:justify-end">
          <span className="hidden lg:block lg:absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm">
            Search documents and posts...
          </span>
          <span className="hidden flex-row gap-1 items-center border rounded-full p-1 px-2 lg:flex lg:absolute top-1/2 left-0 transform -translate-y-1/2 text-sm text-neutral-400">
            <CommandIcon className="w-3 h-3" />+ K
          </span>
          <SearchIcon className="md:mr-2 font-normal max-w-4 max-h-4" />
        </span>
      </Button>

      {isDesktop ? (
        <dialog className="bg-transparent top-0" id="dialog">
          <section
            className={`top-10 left-0 flex flex-col max-w-4xl gap-2 w-full min-w-[90dvw] xl:min-w-[1000px] flex-shrink-0 max-h-[90dvh] overflow-hidden bg-white border-neutral-100 ${
              response || isLoading
                ? "rounded-lg rounded-t-3xl"
                : "rounded-full"
            }`}
          >
            <SearchContent
              search={search}
              setSearch={setSearch}
              isLoading={isLoading}
              handleSearch={handleSearch}
              response={response}
              onClose={handleClose}
            />
          </section>
        </dialog>
      ) : (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTitle></DrawerTitle>

          <DrawerContent className="h-[calc(100vh-1.5rem)] course max-h-[calc(100vh-1.5rem)] overflow-hidden">
            <DrawerHeader className="p-0"></DrawerHeader>
            <SearchContent
              search={search}
              setSearch={setSearch}
              isLoading={isLoading}
              handleSearch={handleSearch}
              response={response}
              onClose={handleClose}
            />
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
