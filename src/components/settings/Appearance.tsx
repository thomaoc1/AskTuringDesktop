import { useTheme, Theme } from "../../contexts/ThemeContext";
import "./settings.css";

const THEMES: {
  id: Theme;
  label: string;
  description: string;
  preview: { bg: string; surface: string; text: string; accent: string };
}[] = [
  {
    id: "light",
    label: "Light",
    description: "Clean white interface for bright environments",
    preview: {
      bg: "#f9fafb",
      surface: "#ffffff",
      text: "#111827",
      accent: "#667eea",
    },
  },
  {
    id: "dark",
    label: "Dark",
    description: "Easy on the eyes in low-light environments",
    preview: {
      bg: "#16213e",
      surface: "#1a1a2e",
      text: "#f1f5f9",
      accent: "#818cf8",
    },
  },
];

export default function Appearance() {
  const { theme, setTheme } = useTheme();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h2 className="settings-page-title">Appearance</h2>
        <p className="settings-page-subtitle">
          Choose how AskTuring looks to you
        </p>
      </div>

      <div className="settings-card" style={{ padding: "1.5rem" }}>
        <p className="appearance-section-label">Color Theme</p>

        <div className="appearance-grid">
          {THEMES.map(({ id, label, description, preview }) => {
            const isSelected = theme === id;
            return (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={`appearance-option${isSelected ? " appearance-option--selected" : ""}`}
              >
                {/* Mini preview */}
                <div
                  className="appearance-preview"
                  style={{ backgroundColor: preview.bg }}
                >
                  <div
                    className="appearance-preview-bar"
                    style={{ backgroundColor: preview.surface }}
                  >
                    <div
                      className="appearance-preview-dot"
                      style={{ backgroundColor: preview.accent }}
                    />
                    <div
                      className="appearance-preview-line"
                      style={{ backgroundColor: preview.text }}
                    />
                  </div>
                  <div className="appearance-preview-body">
                    <div
                      className="appearance-preview-pane"
                      style={{
                        flex: 1,
                        backgroundColor: preview.surface,
                        opacity: 0.7,
                      }}
                    />
                    <div
                      className="appearance-preview-pane"
                      style={{
                        width: "3rem",
                        backgroundColor: preview.accent,
                        opacity: 0.8,
                      }}
                    />
                  </div>
                </div>

                <div className="appearance-option-footer">
                  <div>
                    <p className="appearance-option-label">{label}</p>
                    <p className="appearance-option-desc">{description}</p>
                  </div>
                  {isSelected && (
                    <div className="appearance-check">
                      <svg fill="none" stroke="white" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
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
