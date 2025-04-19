import React from "react";
import { Handle, Position } from "@xyflow/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

export default function RichMarkdownNode({ data }) {
    const direction = data?.direction
  return (
    <div className="p-2 bg-transparent shadow-md max-w-[180px]">
      <Handle type="target" position={direction == 'TB'? Position.Top: Position.Left} />
      <div className="prose prose-sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {data.label}
        </ReactMarkdown>
      </div>
      <Handle type="source" position={direction == 'TB'? Position.Bottom: Position.Right} />
    </div>
  );
}