interface DropdownButtonProps {
  icon: string;
  label: string;
  isOpen: boolean;
  onClick: () => void;
  maxWidth?: string;
}

export default function DropdownButton({
  icon,
  label,
  isOpen,
  onClick,
  maxWidth = "150px",
}: DropdownButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-[system-ui] transition-colors duration-150 cursor-pointer border-none"
      style={{
        backgroundColor: "var(--color-bg-tertiary)",
        color: "var(--color-text-secondary)",
        maxWidth,
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = "var(--color-hover-secondary)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = "var(--color-bg-tertiary)")
      }
    >
      <span>{icon}</span>
      <span className="truncate">{label}</span>
      <span className="text-[10px]">{isOpen ? "▲" : "▼"}</span>
    </button>
  );
}
