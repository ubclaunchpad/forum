"use client";
import {
  ExternalLinkIcon,
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
import { userContext } from "@/contexts/userContext";
import useDocumentQuery from "@/hooks/useDocumentQuery";
import { useCourseStore } from "@/providers/courseStoreProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import AnimatedMarkdown from "../general/AnimatedMarkdown";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import FileViewer from "../files/FileViewer";
import { DocumentInterface } from "@/lib/types/documents";
import { Post } from "@/lib/types/posts";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/utils/helpers";
import PostTextEditor from "../posts/PostTextEditor";

interface Source {
  fe_type: "pdf" | "post" | string;
  url: string;
  title: string;
  similarity: number;
  content: string;
  metadata?: {
    page_number?: number;
    pages?: number[];
    [key: string]: object | number | string | number[] | undefined;
  };
}

interface QuerySource {
  fe_type?: string;
  url?: string;
  signed_url?: string;
  title: string;
  similarity?: number;
  relevance?: number;
  content?: string;
  document_id?: string;
  metadata?: {
    page_number?: number | string;
    [key: string]: number | string | undefined;
  };
}

interface SearchResponse {
  answer: string;
  sources: Source[];
  checkpoint?: {
    label: string;
    expanded?: string;
  };
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

const CONFIDENCE_RANGES = [
  {
    min: 0,
    max: 0.35,
    label: "Might be relevant",
  },
  {
    min: 0.35,
    max: 0.65,
    label: "Probably relevant",
  },
  {
    min: 0.65,
    max: 1,
    label: "Definitely relevant",
  },
];

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
      "flex items-center gap-2  p-1 px-4 no-underline text-primary-800",
    target: source.fe_type === "pdf" ? "_blank" : undefined,
    referrerPolicy:
      source.fe_type === "pdf"
        ? ("no-referrer" as HTMLAttributeReferrerPolicy)
        : undefined,
  };

  // if (source.fe_type === "pdf") {
  //   return (
  //     <Link
  //       {...linkProps}
  //       href={`https://docs.google.com/viewer?url=${encodeURIComponent(source.url)}`}
  //     >
  //       <SourceIcon type={source.fe_type} />
  //       {source.title}
  //     </Link>
  //   );
  // }

  return (
    // <Link {...linkProps} href={source.url}>
    //   <SourceIcon type={source.fe_type} />
    //   {source.title}
    // </Link>

    <p className={linkProps.className}>
      <SourceIcon type={source.fe_type} />

      {source.title}
    </p>
  );
};

const SourceMetadata: React.FC<SourceMetadataProps> = ({ source }) => {
  if (source.fe_type === "pdf" && source.metadata?.pages?.length) {
    return (
      <span className="text-sm text-neutral-500">
        Page{source.metadata.pages.length > 1 ? "s" : ""}{" "}
        {source.metadata.pages.join(", ")}
      </span>
    );
  }
  return null;
};

const DocumentViewerWrapper: React.FC<{ url: string }> = ({ url }) => {
  const course = useCourseStore((state) => state.course);
  const doc: DocumentInterface = {
    id: url.split("/").pop()?.split("_")[0] || "",
    document_type: "application/pdf",
    title: "",
    course_id: course.id,
  };

  return (
    <div className="h-full">
      <FileViewer document={doc} />
    </div>
  );
};

const PostViewerWrapper: React.FC<{ postId: string }> = ({ postId }) => {
  const { token } = useContext(userContext);
  const course = useCourseStore((state) => state.course);
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(
          `${getApiUrl()}/courses/${course.id}/posts/${postId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!response.ok) throw new Error("Failed to fetch post");
        const data = await response.json();
        setPost(data.post);
      } catch (e) {
        console.error("Failed to fetch post", e);
        setError("Failed to fetch post");
      }
    }

    if (postId) {
      fetchPost();
    }
  }, [postId, course.id, token]);

  if (!post) {
    if (error) {
      return <div>Could not load post</div>;
    }
    return <div>Loading...</div>;
  }

  return (
    <>
      <PostTextEditor
        post={post}
        showTitle={false}
        readonly={true}
        title={post.title}
        content={post.content}
        setTitle={() => {}}
        setContent={() => {}}
        handleSave={async () => {}}
      />
    </>
  );
};

const SearchContent: React.FC<SearchContentProps> = ({
  search,
  setSearch,
  isLoading,
  handleSearch,
  response,
  onClose,
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
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
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          showClose={false}
          className="w-full course m-2 max-h-[calc(100dvh-1rem)] rounded-lg overflow-hidden w-full sm:max-w-xl bg-white lg:max-w-3xl"
        >
          <SheetHeader>
            <SheetTitle>{selectedSource?.title}</SheetTitle>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <SourceIcon type={selectedSource?.fe_type || ""} />
              <SourceMetadata source={selectedSource as Source} />
            </div>
          </SheetHeader>
          <div className="mt-4 h-[calc(100vh-10rem)] overflow-hidden">
            {selectedSource &&
              (selectedSource.fe_type === "pdf" ? (
                <DocumentViewerWrapper url={selectedSource.url} />
              ) : selectedSource.fe_type === "post" ? (
                <PostViewerWrapper
                  postId={selectedSource.url.split("/").pop() || ""}
                />
              ) : (
                <div className="prose max-w-none">
                  <AnimatedMarkdown content={selectedSource.content} />
                </div>
              ))}
          </div>
        </SheetContent>
      </Sheet>
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
          <div className="w-full pl-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="font-medium">Searching...</span>
              <span className="text-neutral-500">
                - Looking through documents and posts
              </span>
            </div>
          </div>
          <div className="loading-bar" style={{ animationDelay: "0ms" }}></div>
          <div
            className="loading-bar max-w-sm"
            style={{ animationDelay: "100ms" }}
          ></div>
          <div className="flex gap-2">
            <div
              className="loading-bar max-w-sm"
              style={{ animationDelay: "200ms" }}
            ></div>
            <div
              className="loading-bar max-w-sm"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
          <div
            className="loading-bar"
            style={{ animationDelay: "400ms" }}
          ></div>
          <div
            className="loading-bar max-w-sm"
            style={{ animationDelay: "500ms" }}
          ></div>
          <div
            className="loading-bar"
            style={{ animationDelay: "600ms" }}
          ></div>
          <div
            className="loading-bar max-w-sm"
            style={{ animationDelay: "700ms" }}
          ></div>
        </div>
      )}

      {response && (
        <article className="pt-0 px-4 roundex-xl h-full pb-4 w-full min-h-1 flex flex-col gap-4 overflow-y-auto">
          <div className="flex flex-col w-full rounded-2xl justify-center items-center border-none py-4 pb-0">
            {response.checkpoint && (
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
            )}
            {response.answer && (
              <div className="p-2 text-primary-800 prose max-w-none">
                <AnimatedMarkdown content={response.answer} />
              </div>
            )}

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
            )}
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

  const {
    queryDocuments,
    response: queryResponse,
    isLoading,
  } = useDocumentQuery({
    courseId: course.id,
    token,
  });

  // Transform QueryResponse to SearchResponse
  const response: SearchResponse | null = queryResponse
    ? {
        answer: queryResponse.answer || "",
        checkpoint: queryResponse.checkpoint,
        sources: (() => {
          const sourceMap = new Map<string, Source>();

          // First pass: group and combine sources
          (queryResponse.sources as QuerySource[]).forEach((source) => {
            const sourceType = source.fe_type || "pdf";
            const sourceId =
              sourceType === "post"
                ? source.url?.split("/").pop()
                : source.document_id;
            const key = `${sourceType}-${sourceId}`;

            const url =
              sourceType === "post"
                ? source.url || ""
                : source.signed_url || source.url || "";

            if (sourceMap.has(key)) {
              // Combine metadata for existing source
              const existing = sourceMap.get(key)!;
              if (source.metadata?.page_number) {
                const pages = new Set(existing.metadata?.pages || []);
                pages.add(
                  typeof source.metadata.page_number === "string"
                    ? parseInt(source.metadata.page_number, 10)
                    : source.metadata.page_number,
                );
                existing.metadata = {
                  ...existing.metadata,
                  pages: Array.from(pages).sort((a, b) => a - b),
                };
              }
              // Keep the highest similarity score
              existing.similarity = Math.max(
                existing.similarity,
                source.similarity || source.relevance || 0,
              );
            } else {
              // Create new source entry
              const pageNumber = source.metadata?.page_number;
              const pages = pageNumber
                ? [
                    typeof pageNumber === "string"
                      ? parseInt(pageNumber, 10)
                      : pageNumber,
                  ]
                : [];

              sourceMap.set(key, {
                fe_type: sourceType,
                url,
                title: source.title,
                similarity: source.similarity || source.relevance || 0,
                content: source.content || "",
                metadata: {
                  ...Object.fromEntries(
                    Object.entries(source.metadata || {}).map(([k, v]) => [
                      k,
                      typeof v === "string" ? parseInt(v, 10) || v : v,
                    ]),
                  ),
                  pages,
                },
              });
            }
          });

          // Convert to array and sort by type and similarity
          return Array.from(sourceMap.values()).sort((a, b) => {
            // First sort by type (posts first)
            if (a.fe_type === "post" && b.fe_type !== "post") return -1;
            if (a.fe_type !== "post" && b.fe_type === "post") return 1;
            // Then by similarity
            return b.similarity - a.similarity;
          });
        })(),
      }
    : null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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
  };

  return (
    <>
      <Button
        variant="ghost"
        className="flex w-10 items-center font-medium text-neutral-600 rounded-full px-1 bg-white max-w-full lg:max-w-md min-w-0 lg:min-w-[500px] lg:w-full border overflow-hidden lg:absolute lg:left-1/2 lg:transform h-10 lg:-translate-x-1/2"
        onClick={() => {
          setIsOpen(true);
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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent
            position="tc"
            showClose={false}
            className="flex  course flex-col max-w-4xl gap-2 w-full min-w-[90dvw] xl:min-w-[1000px] flex-shrink-0 max-h-[80dvh] overflow-hidden bg-white border-neutral-100 rounded-lg rounded-t-3xl p-0"
          >
            <DialogHeader className="hidden">
              <DialogTitle>Search Documents and Posts</DialogTitle>
            </DialogHeader>
            <SearchContent
              search={search}
              setSearch={setSearch}
              isLoading={isLoading}
              handleSearch={handleSearch}
              response={response}
              onClose={handleClose}
            />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent className="h-[calc(90dvh-1.5rem)] course max-h-[calc(90dvh-1.5rem)] overflow-hidden">
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
