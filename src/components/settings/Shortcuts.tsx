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

  // Load shortcuts from localStorage on mount and sync with backend
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

      // Sync with backend
      try {
        const shortcutsForBackend = loadedShortcuts.map((s) => ({
          id: s.id,
          keys: s.keys,
        }));
        await invoke("update_shortcuts", { shortcuts: shortcutsForBackend });
        console.log("Initial shortcuts synced with backend");
      } catch (error) {
        console.error("Failed to sync shortcuts with backend:", error);
      }
    };

    loadAndSync();
  }, []);

  // Save shortcuts to localStorage and sync with Rust backend
  const saveShortcuts = useCallback(async (newShortcuts: ShortcutItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newShortcuts));
    setShortcuts(newShortcuts);

    // Send to Rust backend to update global shortcuts
    try {
      const shortcutsForBackend = newShortcuts.map((s) => ({
        id: s.id,
        keys: s.keys,
      }));
      await invoke("update_shortcuts", { shortcuts: shortcutsForBackend });
      console.log("Shortcuts updated in backend");
    } catch (error) {
      console.error("Failed to update shortcuts in backend:", error);
    }
  }, []);

  // Handle keyboard events during recording
  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const keys: string[] = [];

      // Modifiers
      if (e.metaKey || e.key === "Meta") keys.push("Cmd");
      if (e.ctrlKey || e.key === "Control") keys.push("Ctrl");
      if (e.altKey || e.key === "Alt") keys.push("Alt");
      if (e.shiftKey || e.key === "Shift") keys.push("Shift");

      // Regular key
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

      // Only update if we have at least one modifier and one regular key
      if (keys.length >= 2) {
        setRecordedKeys(keys);
      }
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
      const newShortcuts = shortcuts.map((s) =>
        s.id === editingId ? { ...s, keys: recordedKeys } : s,
      );
      saveShortcuts(newShortcuts);
    }
    cancelRecording();
  };

  const cancelRecording = () => {
    setEditingId(null);
    setIsRecording(false);
    setRecordedKeys([]);
  };

  const resetShortcut = (id: string) => {
    const defaultShortcut = DEFAULT_SHORTCUTS.find((s) => s.id === id);
    if (defaultShortcut) {
      const newShortcuts = shortcuts.map((s) =>
        s.id === id ? { ...s, keys: defaultShortcut.keys } : s,
      );
      saveShortcuts(newShortcuts);
    }
  };

  const resetAllShortcuts = () => {
    saveShortcuts(DEFAULT_SHORTCUTS);
  };

  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

  const KeyBadge = ({ keyName }: { keyName: string }) => (
    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
      {keyName}
    </kbd>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Shortcuts
          </h2>
          <p className="text-gray-500">
            Customize keyboard shortcuts to work faster
          </p>
        </div>
        <button
          onClick={resetAllShortcuts}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Reset All
        </button>
      </div>

      {isRecording && (
        <div className="bg-indigo-50 border-2 border-indigo-500 rounded-xl p-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-indigo-100">
              <svg
                className="w-6 h-6 text-indigo-600 animate-pulse"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Recording Shortcut
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Press your desired key combination
            </p>
            {recordedKeys.length > 0 && (
              <div className="flex items-center justify-center gap-1 mb-4">
                {recordedKeys.map((key, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <kbd className="px-3 py-2 text-sm font-semibold text-indigo-900 bg-white border-2 border-indigo-300 rounded-lg shadow-sm">
                      {key}
                    </kbd>
                    {index < recordedKeys.length - 1 && (
                      <span className="text-indigo-600 text-sm font-bold">
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
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  recordedKeys.length >= 2
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Save
              </button>
              <button
                onClick={cancelRecording}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category} className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
                      className={`flex items-center justify-between py-3 border-b border-gray-100 last:border-0 ${
                        isEditing ? "bg-indigo-50 -mx-3 px-3 rounded-lg" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {shortcut.name}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
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
                                <span className="text-gray-400 text-xs">+</span>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startRecording(shortcut.id)}
                            disabled={isRecording}
                            className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                              className="p-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
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
            <p className="text-sm font-medium text-blue-900">
              Note about shortcuts
            </p>
            <p className="text-sm text-blue-700 mt-1">
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
