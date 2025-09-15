"use client";

import { useState, useEffect } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { useTheme } from 'next-themes';

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
  const { resolvedTheme } = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className={className}>{content}</div>;
  }

  const isDark = resolvedTheme === 'dark';

  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const childrenString = children?.toString() || '';
      const inline = !(/\n/.test(childrenString));
      
      if (!inline && match) {
        return (
          <SyntaxHighlighter
            style={isDark ? oneDark : oneLight}
            language={match[1]}
            PreTag="div"
            showLineNumbers={true}
            wrapLines={true}
          >
            {childrenString.replace(/\n$/, '')}
          </SyntaxHighlighter>
        );
      }
      
      return (
        <code className={`${className || ''} ${inline ? 'font-mono text-sm bg-muted px-1 py-0.5 rounded' : ''}`} {...props}>
          {children}
        </code>
      );
    },
    // Add custom styling for other elements
    h1: ({ ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
    h2: ({ ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
    h3: ({ ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
    p: ({ ...props }) => <p className="mb-3" {...props} />,
    ul: ({ ...props }) => <ul className="list-disc pl-5 mb-3" {...props} />,
    ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-3" {...props} />,
    li: ({ ...props }) => <li className="mb-1" {...props} />,
    a: ({ ...props }) => <a className="text-primary hover:underline" {...props} />,
    blockquote: ({ ...props }) => (
      <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-3" {...props} />
    ),
    table: ({ ...props }) => (
      <div className="overflow-x-auto my-3">
        <table className="min-w-full border-collapse" {...props} />
      </div>
    ),
    th: ({ ...props }) => (
      <th className="border px-4 py-2 bg-muted font-bold" {...props} />
    ),
    td: ({ ...props }) => (
      <td className="border px-4 py-2" {...props} />
    ),
  };

  return (
    <div className={`prose max-w-none ${className} ${isDark ? 'prose-invert' : ''} prose-sm sm:prose-base`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}