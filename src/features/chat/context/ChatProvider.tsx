import React, { useMemo } from 'react';
import { CHAT_CONFIG, ChatConfig } from '@/config/app-config';
import { ApiClient } from '@/services/api';
import { ChatService } from '@/services/chat-service';
import { ChatContext } from './ChatContext';
import { useLanguage } from '@/contexts/useLanguage';
import { translations } from '@/i18n/translations';

interface ChatWidgetLocalization {
  welcome?: Partial<ChatConfig['content']['welcome']>;
  followUp?: Partial<ChatConfig['content']['followUp']>;
  changeRequests?: Partial<ChatConfig['content']['changeRequests']>;
  details?: Partial<ChatConfig['content']['details']> & {
    labels?: Partial<ChatConfig['content']['details']['labels']>;
    sections?: Partial<ChatConfig['content']['details']['sections']>;
    placeholders?: Partial<ChatConfig['content']['details']['placeholders']>;
    upload?: Partial<ChatConfig['content']['details']['upload']>;
    actions?: Partial<ChatConfig['content']['details']['actions']>;
  };
  userRequestChange?: Partial<ChatConfig['content']['userRequestChange']> & {
    actions?: Partial<ChatConfig['content']['userRequestChange']['actions']>;
  };
  history?: Partial<ChatConfig['content']['history']> & {
    actions?: Partial<ChatConfig['content']['history']['actions']>;
    messages?: Partial<ChatConfig['content']['history']['messages']>;
  };
  followUpOptions?: string[];
  modificationTags?: string[];
  statusFilters?: ChatConfig['statusFilters'];
  dataMapping?: {
    status: Record<string, string>;
    modules: Record<string, string>;
  };
}

export const ChatProvider: React.FC<{
  config?: Partial<ChatConfig>;
  role?: string;
  currentPage?: string;
  children: React.ReactNode;
}> = ({ config, role = 'dev', currentPage = 'home', children }) => {
  const { language } = useLanguage();

  // Merge provided config with default CHAT_CONFIG
  const mergedConfig = useMemo(() => {
    const baseContent = CHAT_CONFIG.content;
    const localizedContent = ((translations[language] as Record<string, unknown>)?.chatWidget ?? {}) as ChatWidgetLocalization;
    
    // Deep merge of localized content over base content
    const mergedContent = {
      ...baseContent,
      ...localizedContent,
      welcome: { ...baseContent.welcome, ...localizedContent.welcome },
      followUp: { ...baseContent.followUp, ...localizedContent.followUp },
      changeRequests: { ...baseContent.changeRequests, ...localizedContent.changeRequests },
      details: {
        ...baseContent.details,
        ...localizedContent.details,
        labels: { ...baseContent.details.labels, ...localizedContent.details?.labels },
        sections: { ...baseContent.details.sections, ...localizedContent.details?.sections },
        placeholders: { ...baseContent.details.placeholders, ...localizedContent.details?.placeholders },
        upload: { ...baseContent.details.upload, ...localizedContent.details?.upload },
        actions: { ...baseContent.details.actions, ...localizedContent.details?.actions },
      },
      userRequestChange: {
        ...baseContent.userRequestChange,
        ...localizedContent.userRequestChange,
        actions: { ...baseContent.userRequestChange?.actions, ...localizedContent.userRequestChange?.actions }
      },
      history: {
        ...baseContent.history,
        ...localizedContent.history,
        actions: { ...baseContent.history?.actions, ...localizedContent.history?.actions },
        messages: { ...baseContent.history?.messages, ...localizedContent.history?.messages }
      }
    };

    const finalConfig = {
      ...CHAT_CONFIG,
      ...config,
      // Deep merge style so passing just { gradients } doesn't wipe out headerHeight etc.
      style: config?.style
        ? { ...CHAT_CONFIG.style, ...config.style, gradients: { ...CHAT_CONFIG.style.gradients, ...config.style?.gradients } }
        : CHAT_CONFIG.style,
      // Deep merge colors so partial color overrides don't wipe out the full palette
      colors: config?.colors
        ? { ...CHAT_CONFIG.colors, ...config.colors }
        : CHAT_CONFIG.colors,
      followUpOptions: localizedContent.followUpOptions || CHAT_CONFIG.followUpOptions,
      modificationTags: localizedContent.modificationTags || CHAT_CONFIG.modificationTags,
      statusFilters: { ...CHAT_CONFIG.statusFilters, ...(localizedContent.statusFilters || {}) },
      dataMapping: localizedContent.dataMapping || { status: {}, modules: {} },
      content: config?.content ? { ...mergedContent, ...config.content } : mergedContent,
    } as ChatConfig;

    return finalConfig;
  }, [config, language]);

  // Create service instances tailored to this config
  const services = useMemo(() => {
    const api = new ApiClient(mergedConfig.api);
    api.language = language;
    const chat = new ChatService(api);
    return { apiClient: api, chatService: chat };
  }, [mergedConfig.api, language]);

  const value = useMemo(() => ({
    config: mergedConfig,
    role,
    currentPage,
    ...services
  }), [mergedConfig, role, currentPage, services]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
