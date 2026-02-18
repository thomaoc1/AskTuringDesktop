import { useState, useEffect } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useAuthRouter } from "../hooks/useAuthRouter";
import { useSettingsWindow } from "../hooks/useSettingsWindow";
import Account from "../components/settings/Account";
import Shortcuts from "../components/settings/Shortcuts";
import Appearance from "../components/settings/Appearance";

type SubPage = "account" | "shortcuts" | "appearance";

export default function Settings() {
  const [activePage, setActivePage] = useState<SubPage>("account");

  useAuthRouter({ windowLabel: "main" });
  const { handleClose, handleLogout } = useSettingsWindow();

  useEffect(() => {
    const currentWindow = getCurrentWebviewWindow();
    const unlisten = currentWindow.onCloseRequested(async (event) => {
      event.preventDefault();
      handleClose();
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [handleClose]);

  const navItems: { id: SubPage; label: string }[] = [
    { id: "account", label: "Account" },
    { id: "appearance", label: "Appearance" },
    { id: "shortcuts", label: "Shortcuts" },
  ];

  const renderSubPage = () => {
    switch (activePage) {
      case "account":
        return <Account />;
      case "appearance":
        return <Appearance />;
      case "shortcuts":
        return <Shortcuts />;
      default:
        return <Account />;
    }
  };

  return (
    <div
      className="flex h-screen"
      style={{ backgroundColor: "var(--color-bg-secondary)" }}
    >
      {/* Sidebar */}
      <div
        className="w-64 flex flex-col"
        style={{
          backgroundColor: "var(--color-bg)",
          borderRight: "1px solid var(--color-border)",
        }}
      >
        {/* Header */}
        <div
          className="p-6"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <h1
              className="text-xl font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Settings
            </h1>
            <button
              onClick={handleClose}
              className="p-1 rounded-lg transition-colors"
              style={{ color: "var(--color-text-secondary)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--color-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
              title="Close Settings"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ id, label }) => {
            const isActive = activePage === id;
            return (
              <button
                key={id}
                onClick={() => setActivePage(id)}
                className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: isActive
                    ? "var(--color-primary-light)"
                    : "transparent",
                  color: isActive
                    ? "var(--color-primary)"
                    : "var(--color-text-secondary)",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    e.currentTarget.style.backgroundColor =
                      "var(--color-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isActive
                    ? "var(--color-primary-light)"
                    : "transparent";
                }}
              >
                {label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div
          className="p-4"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors"
            style={{ color: "var(--color-danger-text)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--color-danger-bg)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ backgroundColor: "var(--color-bg-secondary)" }}
      >
        <div className="max-w-4xl mx-auto p-8">{renderSubPage()}</div>
      </div>
    </div>
  );
}
