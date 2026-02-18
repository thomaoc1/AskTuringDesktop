import { useMemo } from "react";

interface WebReference {
  index: number;
  url: string;
  source: string;
}

export function useWebReferences(
  content: string,
  conversationId?: string | null,
  projectId?: string
) {
  return useMemo(() => {
    if (!content) return { processedContent: "", references: [] };

    const refs: WebReference[] = [];
    const sourceToIndex = new Map<string, number>();
    let processedContent = content;
    let nextIndex = 1;

    // Extract all <web>source</web> tags
    const webTagRegex = /<web>(.*?)<\/web>/g;
    const matches = Array.from(content.matchAll(webTagRegex));

    matches.forEach((match) => {
      const source = match[1];
      const baseUrl = "https://app.askturing.ai";

      // Determine the URL based on project vs AI chat
      const isProjectChat = projectId && projectId !== "ai-chat";
      const url = conversationId
        ? isProjectChat
          ? `${baseUrl}/projects/${projectId}?conversationId=${conversationId}`
          : `${baseUrl}/ask/${conversationId}`
        : "#";

      // Check if this source has already been seen
      let index: number;
      if (sourceToIndex.has(source)) {
        index = sourceToIndex.get(source)!;
      } else {
        index = nextIndex;
        sourceToIndex.set(source, index);
        refs.push({ index, url, source });
        nextIndex++;
      }

      // Replace <web>source</web> with markdown link [index](url)
      processedContent = processedContent.replace(match[0], `[${index}](${url})`);
    });

    return { processedContent, references: refs };
  }, [content, conversationId, projectId]);
}
