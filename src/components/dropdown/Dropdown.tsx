import { ReactNode } from "react";

interface DropdownProps {
  isOpen: boolean;
  isExpanded?: boolean;
  children: ReactNode;
  minWidth?: string;
  maxHeight?: string;
}

export default function Dropdown({
  isOpen,
  isExpanded = false,
  children,
  minWidth = "160px",
  maxHeight = "200px",
}: DropdownProps) {
  if (!isOpen) return null;

  return (
    <div
      className={`absolute left-0 bg-white rounded-lg shadow-lg
                  border border-gray-200 py-1 overflow-y-auto z-10
                  ${isExpanded ? "bottom-full mb-1" : "top-full mt-1"}`}
      style={{ minWidth, maxHeight }}
    >
      {children}
    </div>
  );
}
