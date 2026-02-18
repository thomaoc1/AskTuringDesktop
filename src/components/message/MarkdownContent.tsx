import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./message.css";

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

          if (inline) {
            const text = String(children);
            const isCurrency =
              /^[$€£¥₹]\s*\d+[\d,.]*(k|m|b|bn|million|billion|trillion)?(\s+\w+)?$/i.test(
                text.trim(),
              );
            if (isCurrency) return <>{children}</>;
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
              className={`md-code-inline ${isUser ? "md-code-inline--user" : "md-code-inline--ai"}`}
              {...props}
            >
              {children}
            </code>
          );
        },
        p({ children }) {
          return <p className="md">{children}</p>;
        },
        ul({ children }) {
          return <ul className="md">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="md">{children}</ol>;
        },
        li({ children }) {
          return <li className="md">{children}</li>;
        },
        strong({ children }) {
          return <strong className="md">{children}</strong>;
        },
        em({ children }) {
          return <em className="md">{children}</em>;
        },
        h1({ children }) {
          return <h1 className="md">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="md">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="md">{children}</h3>;
        },
        blockquote({ children }) {
          return (
            <blockquote
              className={`md blockquote ${isUser ? "md-blockquote--user" : "md-blockquote--ai"}`}
            >
              {children}
            </blockquote>
          );
        },
        a({ href, children }) {
          const isCitation = /^\d+$/.test(String(children));
          if (isCitation) {
            const ref = references.find(
              (r) => r.index === parseInt(String(children)),
            );
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`md-link ${isUser ? "md-link--user" : "md-link--ai"}`}
                title={ref?.source}
              >
                [{children}]
              </a>
            );
          }
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`md md-link ${isUser ? "md-link--user" : "md-link--ai"}`}
            >
              {children}
            </a>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
