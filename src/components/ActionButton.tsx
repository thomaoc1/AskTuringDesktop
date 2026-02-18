interface ActionButtonProps {
  icon: string;
  onClick?: () => void;
  active?: boolean;
}

export default function ActionButton({
  icon,
  onClick,
  active = false,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-[system-ui] transition-colors duration-150 cursor-pointer border-none"
      style={{
        backgroundColor: active
          ? "var(--color-primary-light)"
          : "var(--color-bg-tertiary)",
        color: active ? "var(--color-primary)" : "var(--color-text-secondary)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = active
          ? "var(--color-active)"
          : "var(--color-hover-secondary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = active
          ? "var(--color-primary-light)"
          : "var(--color-bg-tertiary)";
      }}
    >
      <span>{icon}</span>
    </button>
  );
}
