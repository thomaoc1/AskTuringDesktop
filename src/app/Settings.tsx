import { useState, useEffect } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useAuthRouter } from "../hooks/useAuthRouter";
import { useSettingsWindow } from "../hooks/useSettingsWindow";
import Account from "../components/settings/Account";
import Shortcuts from "../components/settings/Shortcuts";

type SubPage = "account" | "shortcuts";

export default function Settings() {
  const [activePage, setActivePage] = useState<SubPage>("account");

  // Auth-driven navigation happens automatically
  useAuthRouter({ windowLabel: "main" });

  // Settings window operations
  const { handleClose, handleLogout } = useSettingsWindow();

  // Prevent OS-level close - hide instead
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

  const renderSubPage = () => {
    switch (activePage) {
      case "account":
        return <Account />;
      case "shortcuts":
        return <Shortcuts />;
      default:
        return <Account />;
    }
  };

  return (
    <div className="flex h-screen bg-transparent">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                title="Close Settings"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
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
            <button
              onClick={() => setActivePage("account")}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activePage === "account"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Account
            </button>
            <button
              onClick={() => setActivePage("shortcuts")}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activePage === "shortcuts"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Shortcuts
            </button>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-4xl mx-auto p-8">{renderSubPage()}</div>
        </div>
    </div>
  );
}
