import "./dropdown.css";

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
  const classes = [
    "dropdown-item",
    isSelected ? "dropdown-item--selected" : "",
    isIndented ? "dropdown-item--indented" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button onClick={onClick} className={classes}>
      {label}
    </button>
  );
}
