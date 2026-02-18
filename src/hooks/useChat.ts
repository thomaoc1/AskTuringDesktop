import { useState, useEffect, useRef } from "react";
import { Message } from "../types";
import { sendAIQuery, sendProjectQuery, processSSEStream } from "../lib/api";

export function useChat(selectedProjectId?: string, webSearchEnabled = false) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue("");
    setIsStreaming(true);

    // Add placeholder for assistant message
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const isProjectChat =
        selectedProjectId && selectedProjectId !== "ai-chat";
      let stream: ReadableStream<Uint8Array>;

      if (isProjectChat) {
        console.log(
          "Sending project query with knowledge_base_id:",
          selectedProjectId,
        );
        stream = await sendProjectQuery(selectedProjectId, messageText, {
          model_name: "auto",
          persona: "general",
          web_search_enabled: webSearchEnabled,
        });
      } else {
        console.log(
          "Sending AI workspace query with conversation_id:",
          conversationId,
        );
        stream = await sendAIQuery({
          query_text: messageText,
          conversation_id: conversationId || undefined,
          model_name: "gpt-4",
          persona: "general",
          web_search_enabled: webSearchEnabled,
        });
      }

      // Process the SSE stream
      for await (const chunk of processSSEStream(stream)) {
        console.log("Received stream chunk:", chunk);

        // Store conversation_id when we receive it
        if (chunk.conversation_id && !conversationId) {
          console.log("Setting conversation_id:", chunk.conversation_id);
          setConversationId(chunk.conversation_id);
        }

        // Update the assistant message with new content
        if (chunk.message) {
          setMessages((prev) => {
            const updated = [...prev];
            const lastMessage = updated[updated.length - 1];
            if (lastMessage && lastMessage.role === "assistant") {
              updated[updated.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + chunk.message,
              };
            }
            return updated;
          });
        }

        // Check if stream is done
        if (chunk.stream_end) {
          console.log("Stream done");
          setIsStreaming(false);
          break;
        }
      }

      setIsStreaming(false);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Detailed error:", errorMessage);

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: `Error: ${errorMessage}`,
        };
        return updated;
      });
      setIsStreaming(false);
    }
  };

  return {
    messages,
    inputValue,
    isStreaming,
    conversationId,
    setInputValue,
    handleSendMessage,
  };
}
