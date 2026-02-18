import { useEffect, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { useWindowManager } from "../hooks/useWindowManager";

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

  const handleSettingsClick = () => {
    windowManager.switchWindows("bubble", "main");
  };

  return (
    <div className="flex items-center gap-3">
      <button onClick={handleSettingsClick} title="Open Settings">
        <img
          src="/askturing-logo.svg"
          alt="AskTuring"
          className="w-10 h-10 flex-shrink-0"
        />
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
        className="w-full px-4 py-3 text-sm font-[system-ui] rounded-xl outline-none box-border transition-all duration-200 border-2"
        style={{
          backgroundColor: isStreaming
            ? "var(--color-bg-secondary)"
            : "var(--color-bg)",
          borderColor: "var(--color-border-input)",
          color: "var(--color-text-primary)",
          cursor: isStreaming ? "not-allowed" : "text",
        }}
        onFocus={(e) =>
          (e.currentTarget.style.borderColor = "var(--color-primary)")
        }
        onBlur={(e) =>
          (e.currentTarget.style.borderColor = "var(--color-border-input)")
        }
      />
    </div>
  );
}
