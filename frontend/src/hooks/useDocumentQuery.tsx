"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getApiUrl } from "@/utils/helpers";

interface Source {
  title: string;
  content: string;
  relevance: number;
  metadata: Record<string, string>;
  document_id: string;
  signed_url: string;
  id: string;
}

interface QueryResponse {
  text: string;
  sources: any[];
  result: string;
}

interface StreamChunk {
  answer?: string;
  sources?: Source[];
  done?: boolean;
  error?: string;
  checkpoint?: {
    label: string;
    expanded?: string;
  };
}

function useDocumentQuery({
  courseId,
  token,
  onUpdateSources,
}: {
  courseId: string;
  token: string;
  onUpdateSources?: (sources: Source[]) => void;
}) {
  const [streamedAnswer, setStreamedAnswer] = useState("");
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { mutate: queryDocuments } = useMutation({
    mutationFn: async (question: string) => {
      setIsLoading(true);
      setStreamedAnswer("");
      setResponse(null);
      const response = await fetch(
        `${getApiUrl()}/search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: question,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("ReadableStream not supported in this browser.");
      }

      return response.body.getReader();
    },
    onSuccess: (reader) => {
      setIsLoading(true);
      setStreamedAnswer("");
      readStream(reader);
    },
    onError: (error) => {
      console.error("Query error:", error);
      setResponse({
        answer: "An error occurred while processing your request.",
        sources: [],
      });
      setIsLoading(false);
    },
  });

  async function readStream(reader: ReadableStreamDefaultReader) {
    const decoder = new TextDecoder();
    let buffer = "";

    async function read() {
      try {
        const { done, value } = await reader.read();

        if (done) {
          setIsLoading(false);
          return;
        }

        // Append new data to buffer
        buffer += decoder.decode(value, { stream: true });

        // Split on double newlines (SSE format)
        const lines = buffer.split("\n\n");

        // Process all complete messages except the last one
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line.startsWith("data: ")) {
            try {
              const jsonStr = line.slice(6); // Remove 'data: ' prefix
              const chunk: StreamChunk = JSON.parse(jsonStr);

              if (chunk.error) {
                throw new Error(chunk.error);
              }

              if (chunk.sources) {
                setResponse((prev) => ({
                  answer: prev?.answer || "",
                  sources: chunk.sources || [],
                  checkpoint: prev?.checkpoint,
                }));
                onUpdateSources?.(chunk.sources);
              }

              if (chunk.answer !== undefined) {
                setStreamedAnswer(chunk.answer);
                setResponse((prev) => ({
                  answer: chunk.answer || "",
                  sources: prev?.sources || [],
                  checkpoint: prev?.checkpoint,
                }));
              }

              if (chunk.checkpoint) {
                setResponse((prev) => ({
                  answer: prev?.answer || "",
                  sources: prev?.sources || [],
                  checkpoint: chunk.checkpoint,
                }));
              }

              if (chunk.done) {
                setIsLoading(false);
                return;
              }
            } catch (parseError) {
              console.error("Error parsing chunk:", parseError);
            }
          }
        }

        // Keep the last (potentially incomplete) message in the buffer
        buffer = lines[lines.length - 1];

        // Continue reading
        read();
      } catch (error) {
        console.error("Stream reading error:", error);
        setIsLoading(false);
        setResponse((prev) => ({
          answer:
            prev?.answer || "An error occurred while processing your request.",
          sources: prev?.sources || [],
          checkpoint: prev?.checkpoint,
        }));
      }
    }

    read();
  }

  return {
    queryDocuments,
    streamedAnswer,
    response,
    isLoading,
  };
}

export default useDocumentQuery;
