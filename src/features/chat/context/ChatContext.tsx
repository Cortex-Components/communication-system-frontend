import { createContext, useContext } from 'react';
import { ChatConfig } from '@/config/app-config';
import { ApiClient } from '@/services/api';
import { ChatService } from '@/services/chat-service';

export interface ChatContextType {
  config: ChatConfig;
  role: 'dev' | 'user';
  currentPage: string;
  apiClient: ApiClient;
  chatService: ChatService;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
