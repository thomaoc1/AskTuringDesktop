import { useLayoutEffect, useRef } from "react";
import { Message } from "../../types";
import MessageBubble from "./MessageBubble";
import "./message.css";

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
    <div className="message-list">
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
