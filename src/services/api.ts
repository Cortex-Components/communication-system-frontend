import { APP_CONFIG, ApiConfig } from "@/config/app-config";

/**
 * A configurable API client
 */
export class ApiClient {
  private config: ApiConfig;

  constructor(config: ApiConfig = APP_CONFIG.api) {
    this.config = config;
  }

  get baseUrl(): string {
    return this.config.baseUrl;
  }

  getEndpoint(page: string, endpoint: string, params: Record<string, string | number> = {}): string {
    const pageVal = this.config.pageEndpoints[page] || page;
    let resolvedEndpoint = this.config.endpoints[endpoint] || endpoint;
    
    // Replace {page} placeholder
    resolvedEndpoint = resolvedEndpoint.replace("{page}", pageVal);
    
    // Replace other parameters like {user_id}, {chat_id}, etc.
    Object.entries(params).forEach(([key, value]) => {
      resolvedEndpoint = resolvedEndpoint.replace(`{${key}}`, String(value));
    });
    
    return resolvedEndpoint;
  }

  async get<T>(page: string, endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    const fullPath = this.getEndpoint(page, endpoint, params);
    const response = await fetch(`${this.baseUrl}${fullPath}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  }

  async post<T>(page: string, endpoint: string, data: unknown, params: Record<string, string | number> = {}): Promise<T> {
    const fullPath = this.getEndpoint(page, endpoint, params);
    const response = await fetch(`${this.baseUrl}${fullPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  }
}

// Export a singleton instance with default config for backward compatibility
export const apiClient = new ApiClient();

export default apiClient;

