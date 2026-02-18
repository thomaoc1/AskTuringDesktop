import Dropdown from "./Dropdown";
import DropdownButton from "./DropdownButton";
import DropdownItem from "./DropdownItem";
import "./dropdown.css";

interface ModelOption {
  id: string;
  label: string;
}

interface ModelSelectorProps {
  selectedModel: string;
  onSelect: (modelId: string, modelName: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  isExpanded?: boolean;
}

const MODEL_OPTIONS: ModelOption[] = [
  { id: "auto", label: "Auto" },
  { id: "gpt-5", label: "GPT-5" },
  { id: "gpt-5.2-instant", label: "GPT-5.2 Instant" },
  { id: "gpt-5.2-thinking", label: "GPT-5.2 Thinking" },
  { id: "gpt-5-mini", label: "GPT-5 Mini" },
  { id: "claude-sonnet-4.5", label: "Claude Sonnet 4.5" },
  { id: "claude-haiku-4.5", label: "Claude Haiku 4.5" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "gemini-3-pro", label: "Gemini 3 Pro" },
  { id: "grok-4", label: "Grok 4" },
  { id: "grok-4-fast", label: "Grok 4 Fast" },
];

export default function ModelSelector({
  selectedModel,
  onSelect,
  isOpen,
  onToggle,
  isExpanded = false,
}: ModelSelectorProps) {
  return (
    <div className="dropdown-wrapper">
      <DropdownButton
        icon="🤖"
        label={selectedModel}
        isOpen={isOpen}
        onClick={onToggle}
      />
      <Dropdown isOpen={isOpen} isExpanded={isExpanded} minWidth="180px">
        {MODEL_OPTIONS.map((model) => (
          <DropdownItem
            key={model.id}
            label={model.label}
            onClick={() => onSelect(model.id, model.label)}
            isSelected={selectedModel === model.label}
          />
        ))}
      </Dropdown>
    </div>
  );
}
