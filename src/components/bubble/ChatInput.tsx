import { useEffect, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import "./bubble.css";
import { useWindowManager } from "../../hooks/useWindowManager";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isStreaming: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  isStreaming,
}: ChatInputProps) {
  const windowManager = useWindowManager();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unlistenShowing = listen("window-showing", () => {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    });
    return () => {
      unlistenShowing.then((fn) => fn());
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      windowManager.hide("bubble");
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="chat-input-row">
      <button
        className="chat-input-logo"
        onClick={() => windowManager.switchWindows("bubble", "main")}
        title="Open Settings"
      >
        <img src="/askturing-logo.svg" alt="AskTuring" />
      </button>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={isStreaming}
        autoFocus
        className="chat-input"
      />
    </div>
  );
}
