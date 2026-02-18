export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  conversation_id?: string;
  message_id?: string;
}

export interface Project {
  id: string;
  name: string;
  is_active: boolean;
  export_enabled: boolean;
  file_download_enabled: boolean;
  share_chat_enabled: boolean;
  public_interface_enabled: boolean;
  chat_index_only_enabled: boolean;
  chat_index_and_ai_enabled: boolean;
  chat_ai_only_enabled: boolean;
  chat_web_search_enabled: boolean;
  chat_external_knowledge_enabled: boolean;
  dynamic_prompts_enabled: boolean;
  semantic_map_enabled: boolean;
  default_prompts: string[];
  is_mounted: boolean;
  mount_alias: string | null;
  role: string;
  created_at: string;
  file_count: number;
  source_kb_id: string | null;
}

export interface Collection {
  id: string;
  snapshot_kb_id: string;
  source_kb_id: string;
  publisher_org_id: string;
  publisher_org_name: string;
  published_by_user_id: string;
  publisher_name: string;
  display_name: string;
  description: string;
  tags: string[];
  category: string;
  thumbnail_url: string | null;
  visibility: string;
  sharing_mode: string;
  allow_semantic_map_updates: boolean;
  allow_static_project_creation: boolean;
  approval_status: string;
  creation_status: string;
  reviewed_by_user_id: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  bookmark_count: number;
  project_creation_count: number;
  created_at: string;
  updated_at: string;
  is_bookmarked: boolean;
}
