import React from "react";
import { Handle, Position } from "@xyflow/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';


interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}



export default function RichMarkdownNode({ data }) {
    const direction = data?.direction
  return (
    <div className="p-2 bg-transparent shadow-md max-w-[270px] break-words">
      <Handle type="target" position={direction == 'TB'? Position.Top: Position.Left} />
      <div className="prose prose-sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2 mt-3 border-b pb-2">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-1 mt-2">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-medium text-violet-600 dark:text-violet-400 mb-1 mt-2">{children}</h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-lg font-medium text-purple-600 dark:text-purple-400 mb-2 mt-3">{children}</h4>
            ),
            h5: ({ children }) => (
              <h5 className="text-base font-medium text-fuchsia-600 dark:text-fuchsia-400 mb-2 mt-3">{children}</h5>
            ),
            h6: ({ children }) => (
              <h6 className="text-sm font-medium text-pink-600 dark:text-pink-400 mb-2 mt-3">{children}</h6>
            ),
            
            strong: ({ children }) => (
              <strong className="font-bold text-pink-600 dark:text-pink-400">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic text-pink-600 dark:text-pink-400">{children}</em>
            ),
            
            code: ({ node, inline, className, children, ...props }: CodeProps) => {
              const match = /language-(\w+)/.exec(className || '');
              const lang = match ? match[1] : '';
              
              if (inline || !lang) {
                return (
                  <code className="bg-gray-100 dark:bg-gray-700 rounded px-1 text-red-600 dark:text-red-400" {...props}>
                    {children}
                  </code>
                );
              }
    
              return (
                <SyntaxHighlighter
                  language={lang || 'text'}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: '1rem 0',
                    borderRadius: '0.5rem',
                    background: '#1e1e1e',
                    border: '1px solid #333'
                  }}
                  PreTag="div"
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              );
            },
            
            p: ({ children }) => (
              <p className="mb-3 last:mb-0 text-gray-700 dark:text-gray-300 leading-relaxed">{children}</p >
            ),
            
            a: ({ node, ...props }) => (
              <a 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline" 
                target="_blank" 
                rel="noopener noreferrer" 
                {...props} 
              />
            ),
            
            ul: ({ children }) => (
              <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="mb-1 text-left">{children}</li>
            ),
            
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
                {children}
              </blockquote>
            ),
          }}
        >
          {data.label}
        </ReactMarkdown>
      </div>
      <Handle type="source" position={direction == 'TB'? Position.Bottom: Position.Right} />
    </div>
  );
}



