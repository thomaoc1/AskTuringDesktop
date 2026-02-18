import { supabaseClient } from "./supabase";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

const BACKEND_BASE = import.meta.env.VITE_BACKEND_BASE;

/**
 * Gets the current access token from Supabase session
 */
async function getAccessToken(): Promise<string> {
  const {
    data: { session },
    error,
  } = await supabaseClient.auth.getSession();

  if (error) throw new Error(`Failed to get session: ${error.message}`);
  if (!session?.access_token)
    throw new Error("No access token available. Please log in.");

  return session.access_token;
}

/**
 * Projects / Knowledge Bases API
 */
export async function fetchKnowledgeBases() {
  const accessToken = await getAccessToken();

  const response = await tauriFetch(
    `${BACKEND_BASE}user/active-org/knowledge-bases`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch knowledge bases (${response.status}): ${errorText}`,
    );
  }

  return response.json();
}

/**
 * Collections API
 */
export async function fetchCollections(
  tab: "my_collections" | "org_collections",
) {
  const accessToken = await getAccessToken();

  const response = await tauriFetch(`${BACKEND_BASE}collections?tab=${tab}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch collections (${response.status}): ${errorText}`,
    );
  }

  const data = await response.json();
  return data.collections || [];
}

/**
 * Chat API - AI Workspace Query
 */
export interface AIChatRequest {
  query_text: string;
  conversation_id?: string;
  stream: boolean;
  model_name?: string;
  persona?: string;
  web_search_enabled?: boolean;
  pending_file_ids?: string[];
  client_datetime?: string;
  client_timezone?: string;
}

export interface StreamChunk {
  message?: string;
  conversation_id?: string;
  message_id?: string;
  stream_end?: boolean;
}

export async function sendAIQuery(
  request: Omit<
    AIChatRequest,
    "stream" | "client_datetime" | "client_timezone"
  >,
): Promise<ReadableStream<Uint8Array>> {
  const accessToken = await getAccessToken();

  // Get current datetime and timezone
  const now = new Date();
  const client_datetime = now.toISOString();
  const client_timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const requestBody: AIChatRequest = {
    ...request,
    stream: true,
    client_datetime,
    client_timezone,
  };

  const response = await tauriFetch(`${BACKEND_BASE}chat/ai_workspace/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to send AI query (${response.status}): ${errorText}`,
    );
  }

  if (!response.body) {
    throw new Error("No response body");
  }

  return response.body;
}

/**
 * Chat API - Project Chat Query
 */
export interface ProjectChatRequest {
  knowledge_base_id: string;
  query_text: string;
  stream: boolean;
  model_name: string;
  is_rag_enabled: boolean;
  is_ai_assist_enabled: boolean;
  web_search_enabled: boolean;
  persona: string;
  deepen_answer: boolean;
  file_ids: string[];
  pending_file_ids: string[];
  client_datetime: string;
  client_timezone: string;
}

export async function sendProjectQuery(
  knowledge_base_id: string,
  query_text: string,
  options: {
    model_name?: string;
    persona?: string;
    web_search_enabled?: boolean;
  } = {},
): Promise<ReadableStream<Uint8Array>> {
  const accessToken = await getAccessToken();

  // Get current datetime and timezone
  const now = new Date();
  const client_datetime = now.toISOString();
  const client_timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const requestBody: ProjectChatRequest = {
    knowledge_base_id,
    query_text,
    stream: true,
    model_name: options.model_name || "auto",
    is_rag_enabled: true,
    is_ai_assist_enabled: false,
    web_search_enabled: options.web_search_enabled || false,
    persona: options.persona || "general",
    deepen_answer: false,
    file_ids: [],
    pending_file_ids: [],
    client_datetime,
    client_timezone,
  };

  const response = await tauriFetch(`${BACKEND_BASE}chat/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to send project query (${response.status}): ${errorText}`,
    );
  }

  if (!response.body) {
    throw new Error("No response body");
  }

  return response.body;
}

/**
 * Process SSE (Server-Sent Events) stream
 */
export async function* processSSEStream(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<StreamChunk, void, unknown> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE messages (lines ending with \n\n)
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || ""; // Keep the last incomplete part in buffer

      for (const part of parts) {
        const lines = part.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6); // Remove "data: " prefix

            try {
              const json = JSON.parse(data);
              yield {
                message: json.message,
                conversation_id: json.conversation_id,
                message_id: json.message_id,
                stream_end: json.stream_end,
              };
            } catch (e) {
              console.error("Failed to parse SSE data:", data, e);
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
