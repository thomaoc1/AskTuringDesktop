import { Message } from "../../types";
import { useWebReferences } from "../../hooks/useWebReferences";
import LoadingDots from "./LoadingDots";
import MarkdownContent from "./MarkdownContent";

interface MessageBubbleProps {
  message: Message;
  conversationId?: string | null;
  projectId?: string;
}

export default function MessageBubble({
  message,
  conversationId,
  projectId,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const { processedContent, references } = useWebReferences(
    message.content,
    conversationId,
    projectId,
  );

  return (
    <div
      className="max-w-[80%] px-3.5 py-2.5 rounded-xl font-[system-ui] text-sm leading-relaxed break-words"
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        backgroundColor: isUser
          ? "var(--color-msg-user-bg)"
          : "var(--color-msg-ai-bg)",
        color: isUser
          ? "var(--color-msg-user-text)"
          : "var(--color-msg-ai-text)",
      }}
    >
      {processedContent ? (
        <MarkdownContent
          content={processedContent}
          references={references}
          isUser={isUser}
        />
      ) : (
        message.role === "assistant" && <LoadingDots />
      )}
    </div>
  );
}
