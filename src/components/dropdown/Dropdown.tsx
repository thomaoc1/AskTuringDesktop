import { ReactNode } from "react";
import "./dropdown.css";

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
      className={`dropdown-panel ${isExpanded ? "dropdown-panel--above" : "dropdown-panel--below"}`}
      style={{ minWidth, maxHeight }}
    >
      {children}
    </div>
  );
}
