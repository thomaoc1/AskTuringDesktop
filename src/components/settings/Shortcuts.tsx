import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./settings.css";

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
      let loaded = DEFAULT_SHORTCUTS;
      if (stored) {
        try {
          loaded = JSON.parse(stored);
          setShortcuts(loaded);
        } catch (e) {
          console.error("Failed to load shortcuts:", e);
        }
      }
      try {
        await invoke("update_shortcuts", {
          shortcuts: loaded.map((s) => ({ id: s.id, keys: s.keys })),
        });
      } catch (e) {
        console.error("Failed to sync shortcuts:", e);
      }
    };
    loadAndSync();
  }, []);

  const saveShortcuts = useCallback(async (next: ShortcutItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setShortcuts(next);
    try {
      await invoke("update_shortcuts", {
        shortcuts: next.map((s) => ({ id: s.id, keys: s.keys })),
      });
    } catch (e) {
      console.error("Failed to update shortcuts:", e);
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
      const k = e.key.toUpperCase();
      if (!["META", "CONTROL", "ALT", "SHIFT"].includes(k) && k.length === 1)
        keys.push(k);
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
  const cancelRecording = () => {
    setEditingId(null);
    setIsRecording(false);
    setRecordedKeys([]);
  };
  const saveRecording = () => {
    if (editingId && recordedKeys.length >= 2)
      saveShortcuts(
        shortcuts.map((s) =>
          s.id === editingId ? { ...s, keys: recordedKeys } : s,
        ),
      );
    cancelRecording();
  };
  const resetShortcut = (id: string) => {
    const def = DEFAULT_SHORTCUTS.find((s) => s.id === id);
    if (def)
      saveShortcuts(
        shortcuts.map((s) => (s.id === id ? { ...s, keys: def.keys } : s)),
      );
  };

  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="shortcuts-header">
        <div>
          <h2 className="settings-page-title">Shortcuts</h2>
          <p className="settings-page-subtitle">
            Customize keyboard shortcuts to work faster
          </p>
        </div>
        <button
          className="settings-btn-secondary"
          onClick={() => saveShortcuts(DEFAULT_SHORTCUTS)}
        >
          Reset All
        </button>
      </div>

      {isRecording && (
        <div className="shortcuts-recording-banner">
          <div className="shortcuts-recording-icon">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="shortcuts-recording-title">Recording Shortcut</h3>
          <p className="shortcuts-recording-hint">
            Press your desired key combination
          </p>
          {recordedKeys.length > 0 && (
            <div className="shortcuts-recording-keys">
              {recordedKeys.map((key, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <kbd className="shortcuts-recording-key">{key}</kbd>
                  {i < recordedKeys.length - 1 && (
                    <span className="shortcuts-recording-sep">+</span>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="shortcuts-recording-actions">
            <button
              onClick={saveRecording}
              disabled={recordedKeys.length < 2}
              className="settings-btn-primary"
            >
              Save
            </button>
            <button
              onClick={cancelRecording}
              className="settings-btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {categories.map((category) => (
          <div key={category} className="shortcuts-category-card">
            <h3 className="shortcuts-category-title">{category}</h3>
            <div>
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
                      className={`shortcuts-row${isEditing ? " shortcuts-row--editing" : ""}`}
                    >
                      <div style={{ flex: 1 }}>
                        <p className="shortcuts-row-name">{shortcut.name}</p>
                        <p className="shortcuts-row-desc">
                          {shortcut.description}
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          marginLeft: "1rem",
                        }}
                      >
                        <div className="shortcuts-keys">
                          {shortcut.keys.map((key, i) => (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                            >
                              <kbd className="shortcuts-key">{key}</kbd>
                              {i < shortcut.keys.length - 1 && (
                                <span className="shortcuts-key-sep">+</span>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="shortcuts-row-actions">
                          <button
                            onClick={() => startRecording(shortcut.id)}
                            disabled={isRecording}
                            className="shortcuts-icon-btn shortcuts-icon-btn--edit"
                            title="Edit shortcut"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              width="16"
                              height="16"
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
                              className="shortcuts-icon-btn shortcuts-icon-btn--reset"
                              title="Reset to default"
                            >
                              <svg
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
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

      <div className="shortcuts-info-box">
        <svg
          className="shortcuts-info-icon"
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
          <p className="shortcuts-info-title">Note about shortcuts</p>
          <p className="shortcuts-info-body">
            Changes to shortcuts take effect immediately. Make sure to use
            modifier keys (Cmd/Ctrl/Alt/Shift) combined with a letter or number.
          </p>
        </div>
      </div>
    </div>
  );
}
