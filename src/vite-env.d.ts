/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_PROXY_TARGET: string;
  readonly VITE_PORT: string;
  readonly VITE_ASSISTANT_NAME: string;
  readonly VITE_DEFAULT_ROLE: string;
  readonly VITE_DEFAULT_PAGE: string;
  readonly VITE_WELCOME_TITLE: string;
  readonly VITE_WELCOME_SUBTITLE: string;
  readonly VITE_WELCOME_PROMPT: string;
  readonly VITE_WELCOME_CHAT_BTN: string;
  readonly VITE_WIDGET_TAG_NAME: string;
  readonly VITE_COLOR_PRIMARY: string;
  readonly VITE_COLOR_SECONDARY: string;
  readonly VITE_X_TENANT_ID: string;
  readonly VITE_AVAILABLE_PAGES: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*?inline" {
  const content: string;
  export default content;
}
