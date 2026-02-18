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
      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200
                 rounded-full text-xs font-[system-ui] text-gray-700
                 transition-colors duration-150 cursor-pointer border-none"
      style={{ maxWidth }}
    >
      <span>{icon}</span>
      <span className="truncate">{label}</span>
      <span className="text-[10px]">{isOpen ? "▲" : "▼"}</span>
    </button>
  );
}
