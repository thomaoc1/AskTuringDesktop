import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useChat } from "../hooks/useChat";
import { useProjects } from "../hooks/useProjects";
import { useCollections } from "../hooks/useCollections";
import { useAuthRouter } from "../hooks/useAuthRouter";
import { useBubbleState } from "../hooks/useBubbleState";
import MessageList from "../components/message/MessageList";
import ChatInput from "../components/ChatInput";
import ActionButtons from "../components/ActionButtons";
import BubbleHeader from "../components/bubble/BubbleHeader";
import BubbleContainer from "../components/bubble/BubbleContainer";

export default function Bubble() {
  const { isAuthenticated, isAuthenticating } = useAuthRouter({
    windowLabel: "bubble",
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isWebEnabled, setIsWebEnabled] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("ai-chat");
  const [selectedProjectName, setSelectedProjectName] = useState("AI Chat");
  const [_, setSelectedModelId] = useState("auto");
  const [selectedModelName, setSelectedModelName] = useState("Auto");

  // Consolidates animation + resize logic (replaces useBubbleWindow.ts)
  const { isVisible, COLLAPSED_HEIGHT, EXPANDED_HEIGHT } = useBubbleState(
    isExpanded,
    isDropdownOpen,
  );

  const {
    messages,
    inputValue,
    isStreaming,
    conversationId,
    setInputValue,
    handleSendMessage,
  } = useChat(selectedProjectId, isWebEnabled);

  const { projects, refetch: refetchProjects } = useProjects();
  const {
    myCollections,
    orgCollections,
    refetch: refetchCollections,
  } = useCollections();

  // Show bubble window only after auth check completes and user is authenticated
  useEffect(() => {
    const showBubbleIfNeeded = async () => {
      if (!isAuthenticating && isAuthenticated) {
        // Auth check complete and user authenticated - show bubble window
        try {
          await invoke("show_bubble_window");
        } catch (error) {
          console.error("Failed to show bubble window:", error);
        }
      }
    };

    showBubbleIfNeeded();
  }, [isAuthenticated, isAuthenticating]);

  useEffect(() => {
    console.log("Projects received from API:", projects);
  }, [projects]);

  useEffect(() => {
    if (messages.length > 0) setIsExpanded(true);
  }, [messages.length]);

  const doSend = async () => {
    if (!isExpanded) setIsExpanded(true);
    await handleSendMessage();
  };

  const handleProjectSelect = (projectId: string, projectName: string) => {
    setSelectedProjectId(projectId);
    setSelectedProjectName(projectName);
    console.log("Selected project:", projectId, projectName);
  };

  const handleModelSelect = (modelId: string, modelName: string) => {
    setSelectedModelId(modelId);
    setSelectedModelName(modelName);
    console.log("Selected model:", modelId, modelName);
  };

  const handleAction = (action: string) => {
    console.log("Action clicked:", action);
    // Add your action handlers here
  };

  const showMessages = messages.length > 0;

  return (
    <BubbleContainer
      isExpanded={isExpanded}
      isVisible={isVisible}
      isAuthenticated={isAuthenticated}
      collapsedHeight={COLLAPSED_HEIGHT}
      expandedHeight={EXPANDED_HEIGHT}
    >
      {isExpanded && (
        <BubbleHeader
          onNavigate={() => console.log("Navigate to conversation")}
          onPin={() => console.log("Pin conversation")}
        />
      )}

      {showMessages && (
        <div className="flex-1 overflow-y-auto min-h-0">
          <MessageList
            messages={messages}
            isStreaming={isStreaming}
            conversationId={conversationId}
            projectId={selectedProjectId}
          />
        </div>
      )}

      <div
        className={`shrink-0 p-3 space-y-2 ${showMessages ? "border-t border-gray-200" : ""}`}
      >
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={doSend}
          isStreaming={isStreaming}
        />
        <ActionButtons
          projects={projects}
          myCollections={myCollections}
          orgCollections={orgCollections}
          selectedProject={selectedProjectName}
          selectedModel={selectedModelName}
          onProjectSelect={handleProjectSelect}
          onModelSelect={handleModelSelect}
          onProjectDropdownOpen={() => {
            refetchProjects();
            refetchCollections();
          }}
          onAction={handleAction}
          onDropdownStateChange={setIsDropdownOpen}
          isExpanded={isExpanded}
          isWebEnabled={isWebEnabled}
          onWebToggle={() => setIsWebEnabled((prev) => !prev)}
        />
      </div>
    </BubbleContainer>
  );
}
