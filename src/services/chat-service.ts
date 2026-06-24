import { ApiClient, apiClient as defaultApiClient } from "./api";

/**
 * Interface representing a message from the backend
 */
export interface UserMessage {
  chat_id: string;
  message_id: string;
  message: string;
  sender: string;
  created_at: string;
}

/**
 * Interface representing a user chat (conversation thread)
 */
export interface UserChat {
  tenant_id: string;
  user_id: string;
  chat_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface EscalationRequest {
  user_id: number;
  session_id: string;
  status?: "pending" | "fixed" | "closed";
  priority: "high" | "normal" | "low";
}

export interface EscalationResponse {
  user_id: number;
  session_id: string;
  status: "pending" | "fixed" | "closed";
  priority: "high" | "normal" | "low";
}

/**
 * Service for handling chat-related API interactions
 */
export class ChatService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient = defaultApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Fetches all chats for a specific user
   * GET /api/v1/user_chats/{user_id}
   */
  async getUserChats(_userId: number): Promise<UserChat[]> {
    return this.apiClient.get<UserChat[]>("home", "user_chats");
  }

  /**
   * Creates a new chat session for a user
   * POST /api/v1/user_chat
   */
  async createChat(_userId: number, title: string): Promise<UserChat> {
    return this.apiClient.post<UserChat>("home", "create_user_chat", { 
      title: title
    });
  }

  /**
   * Fetches details for a specific chat
   * GET /api/v1/user_chat/{user_id}/{chat_id}
   */
  async getChat(_userId: number, chatId: string): Promise<UserChat> {
    return this.apiClient.get<UserChat>("home", "user_chat", { 
      chat_id: chatId 
    });
  }

  /**
   * Fetches messages for a specific user and chat from the backend
   * GET /api/v1/user_message/{user_id}/{chat_id}
   */
  async getUserMessages(_userId: number, chatId: string): Promise<UserMessage[]> {
    const response = await this.apiClient.get<UserMessage[]>("home", "user_messages", { 
      chat_id: chatId 
    });
    console.log(`[ChatService] Messages for ${chatId}:`, response);
    return response;
  }

  /**
   * Sends a new message for a specific chat
   * POST /api/v1/user_message
   */
  async sendMessage(_userId: number, chatId: string, message: string, _sender: string = 'user'): Promise<UserMessage> {
    // If we have a token, we should use the authenticated user_message endpoint
    if (this.apiClient.hasToken()) {
      const payload = { 
        chat_id: chatId,
        message: message
      };
      console.log("[ChatService] Sending authenticated message:", payload);
      return this.apiClient.post<UserMessage>("home", "user_message_post", payload);
    }
    
    // Fallback to public endpoint for guest users
    console.log("[ChatService] Sending public message for chat:", chatId);
    return this.apiClient.post<UserMessage>("home", "create_message", {}, { chat_id: chatId }, { message: message });
  }

  /**
   * Creates an escalation request
   * POST /api/v1/escalation
   */
  async createEscalation(data: EscalationRequest): Promise<EscalationResponse> {
    return this.apiClient.post<EscalationResponse>("home", "escalation", data);
  }

  /**
   * Fetches the list of all escalations
   * GET /api/v1/escalations
   */
  async getEscalations(): Promise<EscalationResponse[]> {
    return this.apiClient.get<EscalationResponse[]>("home", "escalations");
  }

  /**
   * Fetches details for a specific escalation
   * GET /api/v1/escalation/{user_id}/{session_id}
   */
  async getEscalationDetails(_userId: number, sessionId: string): Promise<EscalationResponse> {
    return this.apiClient.get<EscalationResponse>("home", "escalation_details", {
      session_id: sessionId
    });
  }

  /**
   * Fetches all escalations for a specific user
   * GET /api/v1/escalation/{user_id}
   */
  async getUserEscalations(_userId: number): Promise<EscalationResponse[]> {
    return this.apiClient.get<EscalationResponse[]>("home", "user_escalations");
  }

  /**
   * Deletes chat sessions for a user (supports bulk delete)
   * POST /api/v1/user/chats/delete
   */
  async deleteChats(_userId: number, chatIds: string[]): Promise<{ message: string }> {
    return this.apiClient.delete<{ message: string }>("home", "delete_chat", chatIds);
  }
}

// Export a singleton instance with default apiClient for backward compatibility
export const chatService = new ChatService();

export default chatService;

