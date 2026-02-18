import { useState, useRef, useEffect } from "react";

export function useDropdown() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (dropdownId: string) => {
    setOpenDropdown((current) => (current === dropdownId ? null : dropdownId));
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  return {
    openDropdown,
    dropdownRef,
    toggleDropdown,
    closeDropdown,
  };
}
