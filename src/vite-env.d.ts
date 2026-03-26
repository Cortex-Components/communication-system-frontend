/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_SUPPORT_EMAIL: string;
  readonly VITE_PROXY_TARGET: string;
  readonly VITE_PORT: string;
  readonly VITE_ASSISTANT_NAME: string;
  readonly VITE_DEFAULT_USER_ID: string;
  readonly VITE_DEFAULT_USER_NAME: string;
  readonly VITE_WELCOME_TITLE: string;
  readonly VITE_WELCOME_SUBTITLE: string;
  readonly VITE_WELCOME_PROMPT: string;
  readonly VITE_WELCOME_CHAT_BTN: string;
  readonly VITE_WELCOME_FOLLOW_BTN: string;
  readonly VITE_ROLE_DEV: string;
  readonly VITE_ROLE_USER: string;
  readonly VITE_FOLLOW_UP_OPTIONS: string;
  readonly VITE_MODIFICATION_TAGS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*?inline" {
  const content: string;
  export default content;
}
