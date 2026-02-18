import { ReactNode } from "react";

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
      <div
        className="my-1"
        style={{ borderTop: "1px solid var(--color-border)" }}
      />
      <div
        className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide"
        style={{ color: "var(--color-text-muted)" }}
      >
        {title}
      </div>
      {children}
    </>
  );
}
