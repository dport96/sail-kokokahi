'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownTextProps {
  children: string;
  className?: string;
}

export function MarkdownText({ children, className }: MarkdownTextProps) {
  const source = typeof children === 'string' ? children.trim() : '';

  if (!source) {
    return null;
  }

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        skipHtml
        components={{
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          p: ({ children }) => <p className="mb-2">{children}</p>,
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownText;
