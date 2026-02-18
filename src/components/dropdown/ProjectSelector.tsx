import { Project, Collection } from "../../types";
import Dropdown from "./Dropdown";
import DropdownButton from "./DropdownButton";
import DropdownItem from "./DropdownItem";
import DropdownSection from "./DropdownSection";

interface ProjectSelectorProps {
  projects: Project[];
  myCollections: Collection[];
  orgCollections: Collection[];
  selectedProject: string;
  onSelect: (projectId: string, projectName: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  isExpanded?: boolean;
}

export default function ProjectSelector({
  projects,
  myCollections,
  orgCollections,
  selectedProject,
  onSelect,
  isOpen,
  onToggle,
  isExpanded = false,
}: ProjectSelectorProps) {
  return (
    <div className="relative">
      <DropdownButton
        icon="📁"
        label={selectedProject}
        isOpen={isOpen}
        onClick={onToggle}
      />
      <Dropdown isOpen={isOpen} isExpanded={isExpanded}>
        <DropdownItem
          label="AI Chat"
          onClick={() => onSelect("ai-chat", "AI Chat")}
          isSelected={selectedProject === "AI Chat"}
        />

        {projects.length > 0 && (
          <DropdownSection title="Projects">
            {projects.map((project) =>
              project.role !== "No Access" ? (
                <DropdownItem
                  key={project.id}
                  label={project.name}
                  onClick={() => onSelect(project.id, project.name)}
                  isSelected={selectedProject === project.name}
                  isIndented
                />
              ) : null
            )}
          </DropdownSection>
        )}

        {myCollections.length > 0 && (
          <DropdownSection title="My Collections">
            {myCollections.map((collection) => (
              <DropdownItem
                key={collection.id}
                label={collection.display_name}
                onClick={() =>
                  onSelect(collection.snapshot_kb_id, collection.display_name)
                }
                isSelected={selectedProject === collection.display_name}
                isIndented
              />
            ))}
          </DropdownSection>
        )}

        {orgCollections.length > 0 && (
          <DropdownSection title="Organization Collections">
            {orgCollections.map((collection) => (
              <DropdownItem
                key={collection.id}
                label={collection.display_name}
                onClick={() =>
                  onSelect(collection.snapshot_kb_id, collection.display_name)
                }
                isSelected={selectedProject === collection.display_name}
                isIndented
              />
            ))}
          </DropdownSection>
        )}
      </Dropdown>
    </div>
  );
}
