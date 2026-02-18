interface DropdownItemProps {
  label: string;
  onClick: () => void;
  isSelected?: boolean;
  isIndented?: boolean;
}

export default function DropdownItem({
  label,
  onClick,
  isSelected = false,
  isIndented = false,
}: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full ${isIndented ? "pl-6" : "px-3"} pr-3 py-2 text-left text-xs font-[system-ui] border-none cursor-pointer transition-colors`}
      style={{
        backgroundColor: isSelected ? "var(--color-active)" : "transparent",
        color: isSelected
          ? "var(--color-primary)"
          : "var(--color-text-primary)",
        fontWeight: isSelected ? 600 : 400,
      }}
      onMouseEnter={(e) => {
        if (!isSelected)
          e.currentTarget.style.backgroundColor = "var(--color-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isSelected
          ? "var(--color-active)"
          : "transparent";
      }}
    >
      {label}
    </button>
  );
}
