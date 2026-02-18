import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface WebReference {
  index: number;
  url: string;
  source: string;
}

interface MarkdownContentProps {
  content: string;
  references: WebReference[];
  isUser: boolean;
}

export default function MarkdownContent({
  content,
  references,
  isUser,
}: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          const inline = !className;

          // Check if inline code contains only currency-like patterns
          if (inline) {
            const text = String(children);
            // Match currency patterns like $50, $50 billion, €100, £200, etc.
            const isCurrency =
              /^[$€£¥₹]\s*\d+[\d,.]*(k|m|b|bn|million|billion|trillion)?(\s+\w+)?$/i.test(
                text.trim(),
              );

            // If it's just currency, render as plain text instead of code
            if (isCurrency) {
              return <>{children}</>;
            }
          }

          return !inline && match ? (
            <SyntaxHighlighter
              style={oneDark as any}
              language={match[1]}
              PreTag="div"
              customStyle={{
                margin: "0.5em 0",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
              }}
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code
              className={`${isUser ? "bg-[#5568d3]" : "bg-gray-200"} px-1.5 py-0.5 rounded text-xs`}
              {...props}
            >
              {children}
            </code>
          );
        },
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>;
        },
        ul({ children }) {
          return (
            <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
          );
        },
        ol({ children }) {
          return (
            <ol className="list-decimal list-inside mb-2 space-y-1">
              {children}
            </ol>
          );
        },
        li({ children }) {
          return <li className="ml-2">{children}</li>;
        },
        a({ href, children }) {
          // Check if this is a numbered citation [1], [2], etc.
          const isCitation = /^\d+$/.test(String(children));

          if (isCitation) {
            const citationNum = parseInt(String(children));
            const ref = references.find((r) => r.index === citationNum);

            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${isUser ? "text-white" : "text-blue-600"} hover:opacity-80 font-medium`}
                title={ref?.source}
              >
                [{children}]
              </a>
            );
          }

          // Regular link
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline ${isUser ? "text-white" : "text-blue-600"} hover:opacity-80`}
            >
              {children}
            </a>
          );
        },
        strong({ children }) {
          return <strong className="font-semibold">{children}</strong>;
        },
        em({ children }) {
          return <em className="italic">{children}</em>;
        },
        blockquote({ children }) {
          return (
            <blockquote
              className={`border-l-4 ${isUser ? "border-white/50" : "border-gray-400"} pl-3 my-2 italic`}
            >
              {children}
            </blockquote>
          );
        },
        h1({ children }) {
          return <h1 className="text-lg font-bold mb-2 mt-1">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-base font-bold mb-2 mt-1">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-sm font-bold mb-1 mt-1">{children}</h3>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
