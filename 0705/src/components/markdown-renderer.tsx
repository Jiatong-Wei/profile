import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExternalLink } from "lucide-react";
import { renderWikiLinks } from "@/lib/content";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const value = href ?? "";
            const isExternal = /^https?:\/\//.test(value);

            if (isExternal) {
              return (
                <a href={value} target="_blank" rel="noreferrer">
                  {children}
                  <ExternalLink aria-hidden="true" size={13} />
                </a>
              );
            }

            return <Link href={value}>{children}</Link>;
          }
        }}
      >
        {renderWikiLinks(content)}
      </ReactMarkdown>
    </div>
  );
}
