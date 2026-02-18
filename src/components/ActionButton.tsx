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
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-[system-ui] text-gray-700
                 transition-colors duration-150 cursor-pointer border-none
                 ${active ? "bg-blue-100 hover:bg-blue-200" : "bg-gray-100 hover:bg-gray-200"}`}
    >
      <span>{icon}</span>
    </button>
  );
}
