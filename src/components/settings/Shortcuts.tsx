import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

interface ShortcutItem {
  id: string;
  name: string;
  description: string;
  keys: string[];
  category: string;
}

const DEFAULT_SHORTCUTS: ShortcutItem[] = [
  {
    id: "show-hide-bubble",
    name: "Show/Hide Bubble",
    description: "Hide/Show the bubble window",
    keys: ["Cmd", "Shift", "K"],
    category: "Window",
  },
  {
    id: "open-settings",
    name: "Open Settings",
    description: "Open the settings page",
    keys: ["Cmd", ","],
    category: "Navigation",
  },
];

const STORAGE_KEY = "askturing-shortcuts";

export default function Shortcuts() {
  const [shortcuts, setShortcuts] = useState<ShortcutItem[]>(DEFAULT_SHORTCUTS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recordedKeys, setRecordedKeys] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const loadAndSync = async () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      let loadedShortcuts = DEFAULT_SHORTCUTS;
      if (stored) {
        try {
          loadedShortcuts = JSON.parse(stored);
          setShortcuts(loadedShortcuts);
        } catch (error) {
          console.error("Failed to load shortcuts:", error);
        }
      }
      try {
        const shortcutsForBackend = loadedShortcuts.map((s) => ({
          id: s.id,
          keys: s.keys,
        }));
        await invoke("update_shortcuts", { shortcuts: shortcutsForBackend });
      } catch (error) {
        console.error("Failed to sync shortcuts with backend:", error);
      }
    };
    loadAndSync();
  }, []);

  const saveShortcuts = useCallback(async (newShortcuts: ShortcutItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newShortcuts));
    setShortcuts(newShortcuts);
    try {
      const shortcutsForBackend = newShortcuts.map((s) => ({
        id: s.id,
        keys: s.keys,
      }));
      await invoke("update_shortcuts", { shortcuts: shortcutsForBackend });
    } catch (error) {
      console.error("Failed to update shortcuts in backend:", error);
    }
  }, []);

  useEffect(() => {
    if (!isRecording) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const keys: string[] = [];
      if (e.metaKey || e.key === "Meta") keys.push("Cmd");
      if (e.ctrlKey || e.key === "Control") keys.push("Ctrl");
      if (e.altKey || e.key === "Alt") keys.push("Alt");
      if (e.shiftKey || e.key === "Shift") keys.push("Shift");
      const key = e.key.toUpperCase();
      if (
        key !== "META" &&
        key !== "CONTROL" &&
        key !== "ALT" &&
        key !== "SHIFT" &&
        key.length === 1
      ) {
        keys.push(key);
      }
      if (keys.length >= 2) setRecordedKeys(keys);
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isRecording]);

  const startRecording = (id: string) => {
    setEditingId(id);
    setIsRecording(true);
    setRecordedKeys([]);
  };

  const saveRecording = () => {
    if (editingId && recordedKeys.length >= 2) {
      saveShortcuts(
        shortcuts.map((s) =>
          s.id === editingId ? { ...s, keys: recordedKeys } : s,
        ),
      );
    }
    cancelRecording();
  };

  const cancelRecording = () => {
    setEditingId(null);
    setIsRecording(false);
    setRecordedKeys([]);
  };

  const resetShortcut = (id: string) => {
    const def = DEFAULT_SHORTCUTS.find((s) => s.id === id);
    if (def)
      saveShortcuts(
        shortcuts.map((s) => (s.id === id ? { ...s, keys: def.keys } : s)),
      );
  };

  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

  const KeyBadge = ({ keyName }: { keyName: string }) => (
    <kbd
      className="px-2 py-1 text-xs font-semibold rounded"
      style={{
        color: "var(--color-text-primary)",
        backgroundColor: "var(--color-bg-tertiary)",
        border: "1px solid var(--color-border)",
      }}
    >
      {keyName}
    </kbd>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            Shortcuts
          </h2>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Customize keyboard shortcuts to work faster
          </p>
        </div>
        <button
          onClick={() => saveShortcuts(DEFAULT_SHORTCUTS)}
          className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
          style={{
            color: "var(--color-text-secondary)",
            backgroundColor: "var(--color-bg)",
            border: "1px solid var(--color-border)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--color-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--color-bg)")
          }
        >
          Reset All
        </button>
      </div>

      {isRecording && (
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: "var(--color-primary-light)",
            border: "2px solid var(--color-primary)",
          }}
        >
          <div className="text-center">
            <div
              className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full"
              style={{ backgroundColor: "var(--color-active)" }}
            >
              <svg
                className="w-6 h-6 animate-pulse"
                style={{ color: "var(--color-primary)" }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--color-text-primary)" }}
            >
              Recording Shortcut
            </h3>
            <p
              className="text-sm mb-4"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Press your desired key combination
            </p>
            {recordedKeys.length > 0 && (
              <div className="flex items-center justify-center gap-1 mb-4">
                {recordedKeys.map((key, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <kbd
                      className="px-3 py-2 text-sm font-semibold rounded-lg shadow-sm"
                      style={{
                        color: "var(--color-primary)",
                        backgroundColor: "var(--color-bg)",
                        border: "2px solid var(--color-primary)",
                      }}
                    >
                      {key}
                    </kbd>
                    {index < recordedKeys.length - 1 && (
                      <span
                        className="text-sm font-bold"
                        style={{ color: "var(--color-primary)" }}
                      >
                        +
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={saveRecording}
                disabled={recordedKeys.length < 2}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{
                  backgroundColor:
                    recordedKeys.length >= 2
                      ? "var(--color-primary)"
                      : "var(--color-bg-tertiary)",
                  color:
                    recordedKeys.length >= 2
                      ? "var(--color-text-inverted)"
                      : "var(--color-text-muted)",
                  cursor: recordedKeys.length < 2 ? "not-allowed" : "pointer",
                }}
              >
                Save
              </button>
              <button
                onClick={cancelRecording}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{
                  color: "var(--color-text-secondary)",
                  backgroundColor: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--color-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--color-bg)")
                }
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {categories.map((category) => (
          <div
            key={category}
            className="rounded-xl shadow-sm p-6"
            style={{ backgroundColor: "var(--color-bg)" }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              {category}
            </h3>
            <div className="space-y-4">
              {shortcuts
                .filter((s) => s.category === category)
                .map((shortcut) => {
                  const isEditing = editingId === shortcut.id;
                  const isDefault =
                    JSON.stringify(shortcut.keys) ===
                    JSON.stringify(
                      DEFAULT_SHORTCUTS.find((d) => d.id === shortcut.id)?.keys,
                    );

                  return (
                    <div
                      key={shortcut.id}
                      className={`flex items-center justify-between py-3 last:border-0 ${isEditing ? "-mx-3 px-3 rounded-lg" : ""}`}
                      style={{
                        borderBottom: "1px solid var(--color-border)",
                        backgroundColor: isEditing
                          ? "var(--color-primary-light)"
                          : "transparent",
                      }}
                    >
                      <div className="flex-1">
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {shortcut.name}
                        </p>
                        <p
                          className="text-sm mt-1"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {shortcut.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1"
                            >
                              <KeyBadge keyName={key} />
                              {index < shortcut.keys.length - 1 && (
                                <span
                                  className="text-xs"
                                  style={{ color: "var(--color-text-muted)" }}
                                >
                                  +
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startRecording(shortcut.id)}
                            disabled={isRecording}
                            className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              color: "var(--color-primary)",
                              backgroundColor: "var(--color-primary-light)",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "var(--color-active)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "var(--color-primary-light)")
                            }
                            title="Edit shortcut"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                          {!isDefault && (
                            <button
                              onClick={() => resetShortcut(shortcut.id)}
                              disabled={isRecording}
                              className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                color: "var(--color-text-secondary)",
                                backgroundColor: "var(--color-bg-tertiary)",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "var(--color-hover-secondary)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "var(--color-bg-tertiary)")
                              }
                              title="Reset to default"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div
        className="rounded-xl p-4"
        style={{
          backgroundColor: "var(--color-info-bg)",
          border: "1px solid var(--color-info-border)",
        }}
      >
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 mt-0.5 flex-shrink-0"
            style={{ color: "var(--color-info-body)" }}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--color-info-text)" }}
            >
              Note about shortcuts
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--color-info-body)" }}
            >
              Changes to shortcuts take effect immediately. Make sure to use
              modifier keys (Cmd/Ctrl/Alt/Shift) combined with a letter or
              number.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
