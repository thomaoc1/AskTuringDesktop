import { useLayoutEffect, useRef } from "react";
import { Message } from "../../types";
import MessageBubble from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
  conversationId?: string | null;
  projectId?: string;
}

export default function MessageList({
  messages,
  isStreaming,
  conversationId,
  projectId,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isStreaming]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3">
      {messages.map((message: Message) => (
        <MessageBubble
          key={message.id}
          message={message}
          conversationId={conversationId}
          projectId={projectId}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
