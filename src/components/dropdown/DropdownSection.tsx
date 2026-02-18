import { ReactNode } from "react";

interface DropdownSectionProps {
  title: string;
  children: ReactNode;
}

export default function DropdownSection({ title, children }: DropdownSectionProps) {
  return (
    <>
      <div className="my-1 border-t border-gray-200" />
      <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
        {title}
      </div>
      {children}
    </>
  );
}
