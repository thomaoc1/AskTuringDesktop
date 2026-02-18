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
      className={`
        ${isUser ? "self-end bg-[#667eea] text-white" : "self-start bg-gray-100 text-gray-800"}
        max-w-[80%] px-3.5 py-2.5 rounded-xl font-[system-ui] text-sm leading-relaxed break-words
      `}
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
