import { ReactNode } from "react";

interface BubbleContainerProps {
  isExpanded: boolean;
  isVisible: boolean;
  isAuthenticated: boolean;
  collapsedHeight: number;
  expandedHeight: number;
  children: ReactNode;
}

export default function BubbleContainer({
  isExpanded,
  isVisible,
  collapsedHeight,
  expandedHeight,
  children,
}: BubbleContainerProps) {
  const containerHeight = isExpanded ? expandedHeight : collapsedHeight;

  return (
    <div className="w-full h-full flex justify-center items-end bg-transparent">
      <div
        className="w-full p-4 box-border origin-bottom"
        style={{
          height: containerHeight,
          transform: isVisible ? "scale(1)" : "scale(0.8)",
          opacity: isVisible ? 1 : 0,
          transition:
            "height 180ms ease-in-out, transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease-out",
        }}
      >
        <div className="h-full flex flex-col bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
}
