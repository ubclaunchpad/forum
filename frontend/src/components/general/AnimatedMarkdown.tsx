import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AnimatedMarkdownProps {
  content: string;
}

const AnimatedMarkdown: React.FC<AnimatedMarkdownProps> = ({ content }) => {
  const lastContentRef = useRef("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!content.startsWith(lastContentRef.current) && containerRef.current) {
      // Reset for new content
      const elements = containerRef.current.querySelectorAll(
        "p, h1, h2, h3, li, blockquote",
      );
      elements.forEach((el) => {
        el.classList.add("markdown-animate");
      });
    } else if (containerRef.current) {
      // Animate only new elements
      const elements = containerRef.current.querySelectorAll(
        "p, h1, h2, h3, li, blockquote",
      );
      const prevElementCount = lastContentRef.current.split("\n").length;

      elements.forEach((el, index) => {
        if (index >= prevElementCount) {
          el.classList.add("markdown-animate");
        }
      });
    }

    lastContentRef.current = content;
  }, [content]);

  const components = {
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold my-4">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-bold my-3">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-bold my-2">{children}</h3>
    ),
    p: ({ children }) => <p className="my-2">{children}</p>,
    ul: ({ children }) => <ul className="list-disc ml-4 my-2">{children}</ul>,
    ol: ({ children }) => (
      <ol className="list-decimal ml-4 my-2">{children}</ol>
    ),
    li: ({ children }) => <li className="my-1">{children}</li>,
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-200 pl-4 my-2">
        {children}
      </blockquote>
    ),
  };

  return (
    <div ref={containerRef} className="prose max-w-none">
      <style jsx global>{`
        .markdown-animate {
          opacity: 0;
          animation: markdownFadeIn 0.5s ease-out forwards;
        }

        @keyframes markdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default AnimatedMarkdown;
