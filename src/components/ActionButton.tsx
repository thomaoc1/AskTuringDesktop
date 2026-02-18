interface ActionButtonProps {
  icon: string;
  onClick: () => void;
}

export default function ActionButton({ icon, onClick }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200
                 rounded-full text-xs font-[system-ui] text-gray-700
                 transition-colors duration-150 cursor-pointer border-none"
    >
      <span>{icon}</span>
    </button>
  );
}
