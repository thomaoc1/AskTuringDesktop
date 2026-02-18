import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { useWindowManager } from "./useWindowManager";

/**
 * Consolidates bubble window-specific logic:
 * - Window visibility animations (window-showing/hiding events)
 * - Dynamic resizing based on expanded/dropdown state
 *
 * Replaces the old useBubbleWindow.ts with a cleaner, unified API.
 */
export function useBubbleState(isExpanded: boolean, isDropdownOpen: boolean) {
  const windowManager = useWindowManager();
  const [isVisible, setIsVisible] = useState(false);

  const COLLAPSED_HEIGHT = 140;
  const EXPANDED_HEIGHT = 600;

  // Handle animations (window-showing/hiding events)
  useEffect(() => {
    // Trigger animation on mount
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Listen for window show/hide events
    const unlistenShowing = listen("window-showing", () => {
      setIsVisible(true);
    });

    const unlistenHiding = listen("window-hiding", () => {
      setIsVisible(false);
    });

    return () => {
      unlistenShowing.then((fn) => fn());
      unlistenHiding.then((fn) => fn());
    };
  }, []);

  // Handle dynamic resizing (only when visible)
  useEffect(() => {
    const resizeWindow = async () => {
      // Only resize if the window is visible to prevent interfering with other windows
      if (!isVisible) {
        console.log("[useBubbleState] Skipping resize - window not visible");
        return;
      }

      // Add extra height for dropdown when open and collapsed
      const dropdownExtraHeight = !isExpanded && isDropdownOpen ? 220 : 0;
      const targetHeight = isExpanded
        ? EXPANDED_HEIGHT
        : COLLAPSED_HEIGHT + dropdownExtraHeight;

      console.log(`[useBubbleState] Resizing bubble to ${targetHeight}px`);
      await windowManager.resize("bubble", targetHeight);
    };

    resizeWindow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded, isDropdownOpen, isVisible]);

  return {
    isVisible,
    COLLAPSED_HEIGHT,
    EXPANDED_HEIGHT,
  };
}
