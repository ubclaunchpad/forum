"use client";

import {
  CopyIcon,
  DeleteIcon,
  MoreHorizontal,
  RefreshCcwIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useContext, useState, useCallback, useEffect } from "react";
import { userContext } from "@/providers/userContext";
import { useCourseStore } from "@/providers/courseStoreProvider";
import { getApiUrl } from "@/utils/helpers";
import { DocumentInterface } from "@/lib/types/documents";

interface EmbeddingMetadata {
  last_updated: string | null;
  chunk_count: number;
  has_embeddings: boolean;
}

// Helper function to get/set cache
const CACHE_PREFIX = "document_embedding_";
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

function getCachedMetadata(documentId: string): EmbeddingMetadata | null {
  const cached = localStorage.getItem(`${CACHE_PREFIX}${documentId}`);
  if (!cached) return null;

  const { data, timestamp } = JSON.parse(cached);

  // Check if cache is stale
  if (Date.now() - timestamp > CACHE_DURATION) {
    localStorage.removeItem(`${CACHE_PREFIX}${documentId}`);
    return null;
  }

  return data;
}

function setCachedMetadata(documentId: string, data: EmbeddingMetadata) {
  localStorage.setItem(
    `${CACHE_PREFIX}${documentId}`,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    }),
  );
}

export default function DocumentOptionsPopover({
  document,
  setDocuments,
}: {
  document: DocumentInterface;
  setDocuments: React.Dispatch<React.SetStateAction<DocumentInterface[]>>;
}) {
  const user = useContext(userContext);
  const course = useCourseStore((state) => state.course);
  const { toast } = useToast();
  const [metadata, setMetadata] = useState<EmbeddingMetadata | null>(() =>
    getCachedMetadata(`${course.id}_${document.id}`),
  );
  const [isLoading, setIsLoading] = useState(false);

  const getEmbeddingMetadata = useCallback(
    async (forceRefresh = false) => {
      if (!forceRefresh) {
        const cached = getCachedMetadata(`${course.id}_${document.id}`);
        if (cached) {
          setMetadata(cached);
          return cached;
        }
      }

      try {
        const res = await fetch(
          `${getApiUrl()}/courses/${course.id}/documents/${document.id}/embeddings/metadata`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          },
        );

        if (!res.ok) throw new Error("Failed to fetch embedding metadata");

        const data = await res.json();
        setMetadata(data);
        setCachedMetadata(`${course.id}_${document.id}`, data);
        return data;
      } catch {
        return null;
      }
    },
    [course.id, document.id, user.token],
  );

  useEffect(() => {
    getEmbeddingMetadata();
  }, [getEmbeddingMetadata]);

  async function generateEmbeddingData() {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${getApiUrl()}/courses/${course.id}/documents/${document.id}/embeddings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to generate embeddings");

      await getEmbeddingMetadata(true); // Force refresh metadata after generation
      toast({
        title: "Success",
        description: "Embeddings generated successfully",
      });
    } catch (error) {
      console.error("Error generating embeddings:", error);
      toast({
        title: "Error",
        description: "Failed to generate embeddings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    const confirmDelete = confirm(
      "Are you sure you want to delete this document?",
    );
    if (!confirmDelete) return;

    const toDelete = document;
    setDocuments((prev) => prev.filter((d) => d.id !== document.id));

    const res = await fetch(
      `${getApiUrl()}/courses/${course.id}/documents/${document.id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      },
    );
    fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courseId: course.id }),
    });

    if (!res.ok) {
      toast({
        title: "Failed to delete document",
      });
      setDocuments((prev) => [...prev, toDelete]);
    }
  }

  return (
    <Popover>
      <PopoverContent
        side="right"
        align="start"
        alignOffset={-10}
        sideOffset={6}
        className="bg-white border w-fit p-0 border-neutral-200 rounded-lg shadow-sm"
      >
        <ul className="flex p-0 flex-col text-neutral-700 w-full">
          <li>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(document.id);
                toast({
                  title: "Copied ID",
                });
              }}
              className="flex gap-6 font-medium items-center border-b text-sm p-4 py-1 w-full hover:text-primary-500"
            >
              <CopyIcon className="h-4 w-4" />
              <span>Copy ID</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={handleDelete}
              className="text-sm flex gap-6 font-medium items-center p-4 py-1 w-full hover:text-red-500 border-b"
            >
              <DeleteIcon className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </li>
          <div className="border-y flex  flex-col gap-1 ">
            <li>
              <button
                type="button"
                onClick={generateEmbeddingData}
                disabled={isLoading}
                className="text-sm flex gap-6 font-medium items-center p-4 py-1 w-full border-b hover:text-primary-500"
              >
                <RefreshCcwIcon
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                <span>
                  {metadata?.has_embeddings
                    ? "Regenerate embeddings"
                    : "Generate embeddings"}
                </span>
              </button>
            </li>

            {metadata && (
              <li className="p-4 py-1 flex flex-col gap-1 text-xs font-medium items-center text-neutral-600">
                <div className="text-xs">
                  Status:{" "}
                  {metadata.has_embeddings ? "Generated" : "Not generated"}
                </div>
                {metadata.has_embeddings && (
                  <div className="">
                    Last updated:{" "}
                    {new Date(metadata.last_updated!).toLocaleString("en-US", {
                      timeZone: "America/Vancouver",
                      timeZoneName: "short",
                    })}
                  </div>
                )}
              </li>
            )}
          </div>
        </ul>
      </PopoverContent>
      <PopoverTrigger asChild>
        <button type="button" className="focus:outline-none flex-shrink-0 px-2">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </PopoverTrigger>
    </Popover>
  );
}
