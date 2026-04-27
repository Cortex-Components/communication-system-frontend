export interface AiConfig {
  business_name?: string;
  business_description?: string;
  ai_tone?: string;
  default_language?: string;
  system_prompt_override?: string;
  grounding_template_override?: string;
  brand_voice_rules?: Record<string, string | number | boolean> | string;
  custom_intents?: string[] | string;
  escalation_threshold_override?: number;
}

export interface KnowledgeStatus {
  chunk_count: number;
  cache_valid: boolean;
  pdf_count?: number;
  pdf_names?: string[];
}

export interface Faq {
  id: string;
  page: string;
  question: string;
  description: string;
  answer: string;
}

export interface ModalState {
  show: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'confirm';
  onConfirm?: () => void;
}

export type TabId =
  | 'general'
  | 'content'
  | 'persona'
  | 'ai'
  | 'knowledge'
  | 'faqs'
  | 'security';

export type BuildStatus = 'idle' | 'saving' | 'building' | 'success' | 'error';
export type AsyncStatus = 'idle' | 'saving' | 'creating' | 'uploading' | 'success' | 'error';
