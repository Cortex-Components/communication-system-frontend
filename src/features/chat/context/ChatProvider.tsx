import React, { useMemo } from 'react';
import { CHAT_CONFIG, ChatConfig } from '@/config/app-config';
import { ApiClient } from '@/services/api';
import { ChatService } from '@/services/chat-service';
import { ChatContext } from './ChatContext';

export const ChatProvider: React.FC<{
  config?: Partial<ChatConfig>;
  role?: 'dev' | 'user';
  currentPage?: string;
  children: React.ReactNode;
}> = ({ config, role = 'dev', currentPage = 'home', children }) => {
  // Merge provided config with default CHAT_CONFIG
  const mergedConfig = useMemo(() => {
    if (!config) return CHAT_CONFIG;
    
    return {
      ...CHAT_CONFIG,
      ...config,
      api: config.api ? { ...CHAT_CONFIG.api, ...config.api } : CHAT_CONFIG.api,
      layout: config.layout ? { ...CHAT_CONFIG.layout, ...config.layout } : CHAT_CONFIG.layout,
      style: config.style ? { ...CHAT_CONFIG.style, ...config.style } : CHAT_CONFIG.style,
      colors: config.colors ? { ...CHAT_CONFIG.colors, ...config.colors } : CHAT_CONFIG.colors,
      content: config.content ? { ...CHAT_CONFIG.content, ...config.content } : CHAT_CONFIG.content,
      user: config.user ? { ...CHAT_CONFIG.user, ...config.user } : CHAT_CONFIG.user,
    } as ChatConfig;
  }, [config]);

  // Create service instances tailored to this config
  const services = useMemo(() => {
    const api = new ApiClient(mergedConfig.api);
    const chat = new ChatService(api);
    return { apiClient: api, chatService: chat };
  }, [mergedConfig.api]);

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
