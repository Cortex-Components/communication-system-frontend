import { ApiClient, apiClient as defaultApiClient } from "./api";
import { PurchasedModule } from "@/config/app-config";

/**
 * Interface representing a message from the backend
 */
export interface UserMessage {
  user_id: number;
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
  user_id: number;
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

export interface UserAttachment {
  id: number;
  title: string;
  item: string;
  [key: string]: unknown;
}

export interface DeveloperAttachment {
  id: number;
  title: string;
  item: string;
  [key: string]: unknown;
}

export interface DeveloperChangeRequest {
  id: number;
  user_id: number;
  developer_id: number;
  module_id: number;
  change_details: string;
  status: "completed" | "in_progress" | "rejected" | "opened";
  reply?: string;
  updated_at: string;
  created_at: string;
  module_tags?: unknown;
  user_attachments: UserAttachment[];
  developer_attachments: DeveloperAttachment[];
}

export interface UserChangeRequest {
  id: number;
  user_id: number;
  developer_id: number;
  module_id: number;
  change_details: string;
  status: "completed" | "in_progress" | "rejected" | "opened";
  reply?: string;
  updated_at: string;
  created_at: string;
  module_tags?: string[] | null;
  user_attachments: UserAttachment[];
  developer_attachments: DeveloperAttachment[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
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
  async getUserChats(userId: number): Promise<UserChat[]> {
    return this.apiClient.get<UserChat[]>("home", "user_chats", { user_id: userId });
  }

  /**
   * Creates a new chat session for a user
   * POST /api/v1/user_chat
   */
  async createChat(userId: number, title: string): Promise<UserChat> {
    return this.apiClient.post<UserChat>("home", "create_user_chat", { 
      user_id: userId,
      title: title
    });
  }

  /**
   * Fetches details for a specific chat
   * GET /api/v1/user_chat/{user_id}/{chat_id}
   */
  async getChat(userId: number, chatId: string): Promise<UserChat> {
    return this.apiClient.get<UserChat>("home", "user_chat", { 
      user_id: userId,
      chat_id: chatId 
    });
  }

  /**
   * Fetches messages for a specific user and chat from the backend
   * GET /api/v1/user_message/{user_id}/{chat_id}
   */
  async getUserMessages(userId: number, chatId: string): Promise<UserMessage[]> {
    return this.apiClient.get<UserMessage[]>("home", "user_messages", { 
      user_id: userId, 
      chat_id: chatId 
    });
  }

  /**
   * Sends a new message for a specific chat
   * POST /api/v1/user_message
   */
  async sendMessage(userId: number, chatId: string, message: string, sender: 'user' | 'chabot' | 'support' = 'user'): Promise<UserMessage> {
    return this.apiClient.post<UserMessage>("home", "create_message", { 
      user_id: userId,
      chat_id: chatId,
      message: message,
      sender: sender
    });
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
  async getEscalationDetails(userId: number, sessionId: string): Promise<EscalationResponse> {
    return this.apiClient.get<EscalationResponse>("home", "escalation_details", {
      user_id: userId,
      session_id: sessionId
    });
  }

  /**
   * Fetches all escalations for a specific user
   * GET /api/v1/escalation/{user_id}
   */
  async getUserEscalations(userId: number): Promise<EscalationResponse[]> {
    return this.apiClient.get<EscalationResponse[]>("home", "user_escalations", {
      user_id: userId
    });
  }

  /**
   * Deletes chat sessions for a user (supports bulk delete)
   * POST /api/v1/user/chats/delete
   */
  async deleteChats(userId: number, chatIds: string[]): Promise<{ message: string }> {
    return this.apiClient.post<{ message: string }>("home", "delete_chat", {
      user_id: userId,
      chat_ids: chatIds
    });
  }

  /**
   * Fetches the list of modules purchased by the user
   * GET /api/v1/user/purchased-modules/
   */
  async getPurchasedModules(): Promise<PurchasedModule[]> {
    return this.apiClient.get<PurchasedModule[]>("home", "purchased_modules");
  }

  /**
   * Creates a user change request
   * POST /api/v1/user/change-requests/
   */
  async createUserChangeRequest(data: {
    module_id: number;
    change_details: string;
    developer_id: number;
    module_tags?: string[] | null;
  }): Promise<UserChangeRequest> {
    const formData = new FormData();
    formData.append("module_id", data.module_id.toString());
    formData.append("change_details", data.change_details);
    formData.append("developer_id", data.developer_id.toString());
    if (data.module_tags) {
      data.module_tags.forEach(tag => {
        formData.append("module_tags", tag);
      });
    }

    return this.apiClient.post<UserChangeRequest>(
      "home",
      "user_change_requests",
      formData
    );
  }

  /**
   * Fetches user change requests
   * GET /api/v1/user/change-requests/
   */
  async getUserChangeRequests(page?: number, search?: string): Promise<PaginatedResponse<UserChangeRequest>> {
    const queryParams: Record<string, string | number> = {};
    if (page !== undefined) queryParams.page = page;
    if (search !== undefined && search !== "") queryParams.search = search;

    return this.apiClient.get<PaginatedResponse<UserChangeRequest>>(
      "home",
      "user_change_requests",
      {},
      queryParams
    );
  }

  /**
   * Fetches specific user change request details
   * GET /api/v1/user/change-requests/{id}/
   */
  async getUserChangeRequestDetails(id: number): Promise<UserChangeRequest> {
    return this.apiClient.get<UserChangeRequest>(
      "home",
      "user_change_request_details",
      { id }
    );
  }

  /**
   * Updates a user change request
   * PUT /api/v1/user/change-requests/{id}/
   */
  async updateUserChangeRequest(
    id: number, 
    data: { status?: string; reply?: string; module_tags?: unknown }
  ): Promise<UserChangeRequest> {
    return this.apiClient.put<UserChangeRequest>(
      "home",
      "user_change_request_update",
      data,
      { id }
    );
  }

  /**
   * Uploads an attachment to a user change request
   * POST /api/v1/user/change-requests/attachments/
   */
  async uploadUserAttachment(changeRequestId: number, title: string, file: File): Promise<UserAttachment> {
    const formData = new FormData();
    formData.append("change_request", changeRequestId.toString());
    formData.append("title", title);
    formData.append("item", file);

    return this.apiClient.post<UserAttachment>(
      "home",
      "user_change_requests_attachments_create",
      formData
    );
  }

  /**
   * Deletes an attachment from a user change request
   * DELETE /api/v1/user/change-requests/attachments/{id}/
   */
  async deleteUserAttachment(id: number): Promise<void> {
    return this.apiClient.delete<void>(
      "home",
      "user_change_requests_attachments_delete",
      { id }
    );
  }

  /**
   * Deotes a user change request
   * DELETE /api/v1/user/change-requests/{id}/
   */
  async deleteUserChangeRequest(id: number): Promise<void> {
    return this.apiClient.delete<void>(
      "home",
      "user_change_request_delete",
      { id }
    );
  }

  /**
   * Fetches developer change requests
   * GET /api/v1/developer/change-requests/
   */
  async getDeveloperChangeRequests(page?: number, search?: string): Promise<PaginatedResponse<DeveloperChangeRequest>> {
    const queryParams: Record<string, string | number> = {};
    if (page !== undefined) queryParams.page = page;
    if (search !== undefined) queryParams.search = search;

    return this.apiClient.get<PaginatedResponse<DeveloperChangeRequest>>(
      "home", 
      "developer_change_requests", 
      {}, 
      queryParams
    );
  }

  /**
   * Fetches specific developer change request details
   * GET /api/v1/developer/change-requests/{id}/
   */
  async getDeveloperChangeRequestDetails(id: number): Promise<DeveloperChangeRequest> {
    return this.apiClient.get<DeveloperChangeRequest>(
      "home",
      "developer_change_request_details",
      { id }
    );
  }

  /**
   * Updates a developer change request
   * PUT /api/v1/developer/change-requests/{id}/
   */
  async updateDeveloperChangeRequest(
    id: number, 
    data: { status?: string; reply?: string; module_tags?: unknown }
  ): Promise<DeveloperChangeRequest> {
    return this.apiClient.put<DeveloperChangeRequest>(
      "home",
      "developer_change_request_update",
      data,
      { id }
    );
  }

  /**
   * Uploads an attachment to a developer change request
   * POST /api/v1/developer/change-requests/attachments/
   */
  async uploadDeveloperAttachment(changeRequestId: number, title: string, file: File): Promise<DeveloperAttachment> {
    const formData = new FormData();
    formData.append("change_request", changeRequestId.toString());
    formData.append("title", title);
    formData.append("item", file);

    return this.apiClient.post<DeveloperAttachment>(
      "home",
      "developer_change_requests_attachments_create",
      formData
    );
  }
}

// Export a singleton instance with default apiClient for backward compatibility
export const chatService = new ChatService();

export default chatService;

