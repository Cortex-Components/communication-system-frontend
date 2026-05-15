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

  history?: Partial<ChatConfig['content']['history']> & {
    actions?: Partial<ChatConfig['content']['history']['actions']>;
    messages?: Partial<ChatConfig['content']['history']['messages']>;
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
    
    // Deep merge of configuration (base) over localized content (defaults)
    const mergedContent = {
      ...localizedContent,
      ...baseContent,
      welcome: { ...localizedContent.welcome, ...baseContent.welcome },
      followUp: { ...localizedContent.followUp, ...baseContent.followUp },

      history: {
        ...localizedContent.history,
        ...baseContent.history,
        actions: { ...localizedContent.history?.actions, ...baseContent.history?.actions },
        messages: { ...localizedContent.history?.messages, ...baseContent.history?.messages }
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
      content: config?.content
        ? {
            ...mergedContent,
            ...config.content,
            welcome: { ...mergedContent.welcome, ...config.content?.welcome },
            followUp: { ...mergedContent.followUp, ...config.content?.followUp },

          }
        : mergedContent,
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

  // Sync colors to Shadow DOM host whenever they change
  React.useLayoutEffect(() => {
    // Find the shadow host (the custom element itself)
    const tagName = import.meta.env.VITE_WIDGET_TAG_NAME || 'cortex-chat-widget';
    const host = document.querySelector(tagName);
    if (host && host.shadowRoot) {
      const primary = mergedConfig.colors.primary;
      const secondary = mergedConfig.colors.secondary;
      
      // Update variables on the :host style
      const style = (host as HTMLElement).style;
      style.setProperty('--primary', primary);
      style.setProperty('--secondary', secondary);
      style.setProperty('--accent', secondary);
      style.setProperty('--cortex-primary', primary);
      style.setProperty('--cortex-secondary', secondary);
      style.setProperty('--cortex-header-gradient', `linear-gradient(360deg, ${secondary} -68.13%, #858B89 15.94%, ${primary} 100%)`);
      style.setProperty('--cortex-button-gradient', `linear-gradient(270deg, ${secondary} 0%, #858B89 50%, ${primary} 100%)`);
      style.setProperty('--cortex-icon-gradient', `linear-gradient(90deg, ${secondary} 0%, #949791 15.87%, ${primary} 68.27%)`);
    }
  }, [mergedConfig.colors.primary, mergedConfig.colors.secondary]);

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
