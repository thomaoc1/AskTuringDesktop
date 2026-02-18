import "./bubble.css";

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
      className={`action-btn${active ? " action-btn--active" : ""}`}
    >
      <span>{icon}</span>
    </button>
  );
}
