import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Allows customizing built-in components, e.g. to add styling.
    h1: ({ children }) => <h1 className="text-2xl">{children}</h1>,
    h2: ({ children }) => <h2 className="text-lg font-semibold">{children}</h2>,
    p: ({ children }) => <p className="text-md">{children}</p>,
    ul: ({ children }) => (
      <ul className="mt-2 list-disc pl-6 md:text-base">{children}</ul>
    ),
    li: ({ children }) => <li className="text-md">{children}</li>,
    ...components,
  };
}
