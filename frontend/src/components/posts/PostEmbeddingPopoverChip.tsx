"use client";

import { userContext } from "@/contexts/userContext";
import { toast } from "@/hooks/use-toast";
import { Post } from "@/lib/types/posts";
import { useCourseStore } from "@/providers/courseStoreProvider";
import { getApiUrl } from "@/utils/helpers";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { FileScanIcon, RefreshCcwIcon } from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";

interface EmbeddingMetadata {
  last_updated: string | null;
  chunk_count: number;
  has_embeddings: boolean;
}

// Helper function to get/set cache
const CACHE_PREFIX = "post_embedding_";
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

function getCachedMetadata(postId: string): EmbeddingMetadata | null {
  const cached = localStorage.getItem(`${CACHE_PREFIX}${postId}`);
  if (!cached) return null;

  const { data, timestamp } = JSON.parse(cached);

  // Check if cache is stale
  if (Date.now() - timestamp > CACHE_DURATION) {
    localStorage.removeItem(`${CACHE_PREFIX}${postId}`);
    return null;
  }

  return data;
}

function setCachedMetadata(postId: string, data: EmbeddingMetadata) {
  localStorage.setItem(
    `${CACHE_PREFIX}${postId}`,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    }),
  );
}

export default function PostEmbeddingPopoverChip({ post }: { post: Post }) {
  const course = useCourseStore((state) => state.course);
  const user = useContext(userContext);
  const [metadata, setMetadata] = useState<EmbeddingMetadata | null>(() =>
    getCachedMetadata(`${course.id}_${post.local_id}`),
  );
  const [isLoading, setIsLoading] = useState(false);

  const getEmbeddingMetadata = useCallback(
    async (forceRefresh = false) => {
      if (!forceRefresh) {
        const cached = getCachedMetadata(`${course.id}_${post.local_id}`);
        if (cached) {
          setMetadata(cached);
          return cached;
        }
      }

      try {
        const res = await fetch(
          `${getApiUrl()}/courses/${course.id}/posts/${post.local_id}/embeddings/metadata`,
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
        setCachedMetadata(`${course.id}_${post.local_id}`, data);
        return data;
      } catch (error) {
        console.error("Error fetching embedding metadata:", error);
        toast({
          title: "Error",
          description: "Failed to fetch embedding status",
          variant: "destructive",
        });
      }
    },
    [course.id, post.local_id, user.token],
  );

  useEffect(() => {
    getEmbeddingMetadata();
  }, [getEmbeddingMetadata]);

  async function generateEmbeddingData() {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${getApiUrl()}/courses/${course.id}/posts/${post.local_id}/embeddings`,
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

  return (
    <Popover>
      <PopoverContent
        side="right"
        align="start"
        alignOffset={0}
        sideOffset={2}
        className="bg-white border w-fit min-w-[200px] p-0 border-neutral-200 rounded-lg shadow-sm"
      >
        <ul className="flex p-0 flex-col text-neutral-700 w-full">
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
        </ul>
      </PopoverContent>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={() => getEmbeddingMetadata(true)}
          className={`focus:outline-none p-2 rounded-full bg-white border ${metadata?.has_embeddings ? "bg-primary-50 border-primary-200" : ""}`}
        >
          <FileScanIcon
            className={`h-4 w-4 ${metadata?.has_embeddings ? "text-primary-200" : ""}`}
          />
        </button>
      </PopoverTrigger>
    </Popover>
  );
}
