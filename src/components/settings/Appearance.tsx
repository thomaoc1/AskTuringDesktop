import { useTheme, Theme } from "../../contexts/ThemeContext";

const THEMES: { id: Theme; label: string; description: string; preview: { bg: string; surface: string; text: string; accent: string } }[] = [
  {
    id: "light",
    label: "Light",
    description: "Clean white interface for bright environments",
    preview: { bg: "#f9fafb", surface: "#ffffff", text: "#111827", accent: "#667eea" },
  },
  {
    id: "dark",
    label: "Dark",
    description: "Easy on the eyes in low-light environments",
    preview: { bg: "#16213e", surface: "#1a1a2e", text: "#f1f5f9", accent: "#818cf8" },
  },
];

export default function Appearance() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
          Appearance
        </h2>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Choose how AskTuring looks to you
        </p>
      </div>

      <div
        className="rounded-xl shadow-sm p-6"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--color-text-muted)" }}>
          Color Theme
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {THEMES.map(({ id, label, description, preview }) => {
            const isSelected = theme === id;
            return (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className="text-left rounded-xl p-4 transition-all"
                style={{
                  border: isSelected
                    ? "2px solid var(--color-primary)"
                    : "2px solid var(--color-border)",
                  backgroundColor: isSelected ? "var(--color-primary-light)" : "var(--color-bg-secondary)",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = "var(--color-primary)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = "var(--color-border)";
                }}
              >
                {/* Mini preview */}
                <div
                  className="w-full h-20 rounded-lg mb-3 overflow-hidden flex flex-col p-2 gap-1.5"
                  style={{ backgroundColor: preview.bg }}
                >
                  <div className="w-full h-6 rounded-md flex items-center px-2 gap-1.5" style={{ backgroundColor: preview.surface }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: preview.accent }} />
                    <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: preview.text, opacity: 0.15 }} />
                  </div>
                  <div className="flex gap-1.5 flex-1">
                    <div className="flex-1 rounded" style={{ backgroundColor: preview.surface, opacity: 0.7 }} />
                    <div className="w-12 rounded" style={{ backgroundColor: preview.accent, opacity: 0.8 }} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      {label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                      {description}
                    </p>
                  </div>
                  {isSelected && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ml-2"
                      style={{ backgroundColor: "var(--color-primary)" }}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="white" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
