import "./dropdown.css";

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
    <button onClick={onClick} className="dropdown-btn" style={{ maxWidth }}>
      <span>{icon}</span>
      <span className="dropdown-btn__label">{label}</span>
      <span className="dropdown-btn__chevron">{isOpen ? "▲" : "▼"}</span>
    </button>
  );
}
