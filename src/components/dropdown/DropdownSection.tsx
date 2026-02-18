import { ReactNode } from "react";
import "./dropdown.css";

interface DropdownSectionProps {
  title: string;
  children: ReactNode;
}

export default function DropdownSection({
  title,
  children,
}: DropdownSectionProps) {
  return (
    <>
      <hr className="dropdown-section-divider" />
      <div className="dropdown-section-title">{title}</div>
      {children}
    </>
  );
}
