"use client";

import { cn } from "@/lib/utils";
import { useEditor, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import History from "@tiptap/extension-history";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import Heading from "@tiptap/extension-heading";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Blockquote from "@tiptap/extension-blockquote";
import Youtube from "@tiptap/extension-youtube";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import MathExtension from "@aarkue/tiptap-math-extension";

import { FC, useEffect } from "react";

// Create lowlight instance
const lowlight = createLowlight();
lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", js);
lowlight.register("ts", ts);

const editorClasses = cn(
  "w-full h-full flex flex-col",
  "prose",
  "[&_.ProseMirror]:w-full",
  "[&_.ProseMirror]:h-full",
  "[&_.ProseMirror]:p-0",
  "[&_.ProseMirror]:outline-none",
  "[&_.ProseMirror_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
  "[&_.ProseMirror_p.is-editor-empty:first-child]:before:text-neutral-400",
  "[&_.ProseMirror_p.is-editor-empty:first-child]:before:float-left",
  "[&_.ProseMirror_p.is-editor-empty:first-child]:before:h-0",
  "[&_.ProseMirror_p.is-editor-empty:first-child]:before:pointer-events-none",
  "[&_.ProseMirror_p]:my-4",
  "[&_.ProseMirror_h1]:mt-8 [&_.ProseMirror_h1]:mb-4",
  "[&_.ProseMirror_h2]:mt-6 [&_.ProseMirror_h2]:mb-4",
  "[&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_h3]:mb-2",
  "[&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-primary-400 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:my-4",
  "[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ul]:my-4",
  "[&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_ol]:my-4",
  "[&_.ProseMirror_li]:marker:text-neutral-900",
  "[&_.ProseMirror_li]:pl-2",
  "[&_.ProseMirror_li>p]:inline-block",
  "[&_.ProseMirror_li>p]:my-0",
);

interface EditorProps {
  markdown: string;
  editable: boolean;
  className?: string;
  onMarkdownChange: (markdown: string) => void;
}

const Editor: FC<EditorProps> = ({
  markdown,
  editable,
  className,
  onMarkdownChange,
}) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      Placeholder.configure({
        placeholder: ({ node }) => {
          console.log(node);
          if (node.isText && (!node.text || node.text?.length <= 0)) {
            return "...";
          }
          if (node.type.name === "heading") {
            return "What’s the title?";
          }

          return "Write here....";
        },
      }),
      Document,
      Link.configure({
        protocols: ["ftp", "mailto"],
      }),
      Paragraph,
      Text,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      HorizontalRule,
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      History,
      MathExtension.configure({
        evaluation: true,
        katexOptions: {
          output: "mathml",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Youtube.configure({
        controls: false,
        nocookie: true,
        inline: true,
      }),
    ],
    content: markdown,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onMarkdownChange(html);
    },

    // editorProps: {
    //   attributes: {
    //     className: "p-0"
    //   }
    // }
  });

  useEffect(() => {
    if (editor && markdown !== editor.getHTML()) {
      editor.commands.setContent(markdown);
    }
  }, [markdown, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  return (
    <div
      className={cn(
        editorClasses, // Remove vertical margins inside list items
        className,
      )}
    >
      <EditorContent editor={editor} />
    </div>
  );
};

export default Editor;
