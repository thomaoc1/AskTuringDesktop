import { Message } from "../../types";
import { useWebReferences } from "../../hooks/useWebReferences";
import LoadingDots from "./LoadingDots";
import MarkdownContent from "./MarkdownContent";
import "./message.css";

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
      className={`message-bubble ${isUser ? "message-bubble--user" : "message-bubble--assistant"}`}
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
