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
      className={`w-full ${isIndented ? "pl-6" : "px-3"} pr-3 py-2 text-left text-xs font-[system-ui] text-gray-700
                 hover:bg-gray-100 border-none bg-transparent cursor-pointer
                 ${isSelected ? "bg-blue-50 font-semibold" : ""}`}
    >
      {label}
    </button>
  );
}
