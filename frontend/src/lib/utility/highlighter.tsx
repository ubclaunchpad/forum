import { Fragment } from "react";
interface HighlightedTextProps {
  content: string;
  wordsToHighlight: string;
  highlightClassName?: string;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({
  content,
  wordsToHighlight,
  highlightClassName = "bg-primary-200 dark:bg-primary-800 rounded px-0.5",
}) => {
  if (!wordsToHighlight || !content) {
    return <span>{content}</span>;
  }

  // Split the query into individual words and filter out empty strings
const searchWords = wordsToHighlight
    .toLowerCase()
    .split(" ")
    .filter((word: string) => word.trim() !== "");

  if (searchWords.length === 0) {
    return <span>{content}</span>;
  }

  // Create a regex pattern that matches any of the search words (case insensitive)
  const pattern = new RegExp(
    `\\b(${searchWords.map((word) => escapeRegExp(word)).join("|")})\\b`,
    "gi",
  );

  // Use a different approach to highlight matches
  const chunks = [];
  let lastIndex = 0;
  let match;

  // Create a new RegExp object for each search to reset lastIndex
  const regex = new RegExp(pattern);

  while ((match = regex.exec(content)) !== null) {
    // Add the text before the match
    if (match.index > lastIndex) {
      chunks.push({
        text: content.substring(lastIndex, match.index),
        highlight: false,
      });
    }

    // Add the matched text
    chunks.push({
      text: match[0],
      highlight: true,
    });

    lastIndex = regex.lastIndex;
  }

  // Add any remaining text after the last match
  if (lastIndex < content.length) {
    chunks.push({
      text: content.substring(lastIndex),
      highlight: false,
    });
  }

  return (
    <span>
    
      {chunks.map((chunk, i) =>
        chunk.highlight ? (
          <span key={i} className={highlightClassName}>
            {chunk.text}
          </span>
        ) : (
          <Fragment key={i}>{chunk.text}</Fragment>
        ),
      )}
    </span>
  );
};

// Helper function to escape special regex characters
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
