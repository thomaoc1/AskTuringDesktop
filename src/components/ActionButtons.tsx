import { useEffect } from "react";
import { Project, Collection } from "../types";
import { useDropdown } from "../hooks/useDropdown";
import ProjectSelector from "./dropdown/ProjectSelector";
import ModelSelector from "./dropdown/ModelSelector";
import ActionButton from "./ActionButton";

interface ActionButtonsProps {
  projects: Project[];
  myCollections: Collection[];
  orgCollections: Collection[];
  selectedProject: string;
  selectedModel: string;
  onProjectSelect: (projectId: string, projectName: string) => void;
  onModelSelect: (modelId: string, modelName: string) => void;
  onAction?: (action: string) => void;
  onProjectDropdownOpen?: () => void;
  onDropdownStateChange?: (isOpen: boolean) => void;
  isExpanded?: boolean;
}

export default function ActionButtons({
  projects,
  myCollections,
  orgCollections,
  selectedProject,
  selectedModel,
  onProjectSelect,
  onModelSelect,
  onAction,
  onProjectDropdownOpen,
  onDropdownStateChange,
  isExpanded = false,
}: ActionButtonsProps) {
  const { openDropdown, dropdownRef, toggleDropdown, closeDropdown } =
    useDropdown();

  useEffect(() => {
    onDropdownStateChange?.(openDropdown !== null);
  }, [openDropdown, onDropdownStateChange]);

  const handleProjectToggle = () => {
    const willOpen = openDropdown !== "project";
    toggleDropdown("project");
    if (willOpen && onProjectDropdownOpen) {
      onProjectDropdownOpen();
    }
  };

  const handleProjectSelect = (projectId: string, projectName: string) => {
    onProjectSelect(projectId, projectName);
    closeDropdown();
  };

  const handleModelSelect = (modelId: string, modelName: string) => {
    onModelSelect(modelId, modelName);
    closeDropdown();
  };

  return (
    <div className="flex gap-2 justify-center" ref={dropdownRef}>
      <ProjectSelector
        projects={projects}
        myCollections={myCollections}
        orgCollections={orgCollections}
        selectedProject={selectedProject}
        onSelect={handleProjectSelect}
        isOpen={openDropdown === "project"}
        onToggle={handleProjectToggle}
        isExpanded={isExpanded}
      />

      <ModelSelector
        selectedModel={selectedModel}
        onSelect={handleModelSelect}
        isOpen={openDropdown === "model"}
        onToggle={() => toggleDropdown("model")}
        isExpanded={isExpanded}
      />

      <ActionButton icon="🌐" onClick={() => onAction?.("settings")} />
      <ActionButton icon="👤" onClick={() => onAction?.("help")} />
    </div>
  );
}
