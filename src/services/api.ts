import { APP_CONFIG, ApiConfig } from "@/config/app-config";

/**
 * A configurable API client
 */
export class ApiClient {
  private config: ApiConfig;
  public language: string = 'en';

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

  async get<T>(
    page: string, 
    endpoint: string, 
    params: Record<string, string | number> = {}, 
    queryParams: Record<string, string | number> = {},
    customHeaders: Record<string, string> = {}
  ): Promise<T> {
    const fullPath = this.getEndpoint(page, endpoint, params);
    
    // Merge global language into query params
    const mergedQueryParams = { lang: this.language, ...queryParams };
    
    const query = new URLSearchParams(
      Object.entries(mergedQueryParams).map(([k, v]) => [k, String(v)])
    ).toString();
    
    const url = `${this.baseUrl}${fullPath}${query ? `?${query}` : ''}`;

    const token = localStorage.getItem('token') || import.meta.env.VITE_API_TOKEN;
    const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(url, {
      headers: {
        'Accept-Language': this.language,
        ...authHeader,
        ...customHeaders,
      }
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : {} as T;
  }

  async post<T>(
    page: string, 
    endpoint: string, 
    data: unknown, 
    params: Record<string, string | number> = {},
    customHeaders: Record<string, string> = {}
  ): Promise<T> {
    const fullPath = this.getEndpoint(page, endpoint, params);
    
    const token = localStorage.getItem('token') || import.meta.env.VITE_API_TOKEN;
    const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};

    const isFormData = data instanceof FormData;
    const headers: Record<string, string> = {
      'Accept-Language': this.language,
      ...authHeader,
      ...customHeaders,
    };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${this.baseUrl}${fullPath}`, {
      method: 'POST',
      headers,
      body: isFormData ? (data as FormData) : JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : {} as T;
  }

  async put<T>(
    page: string, 
    endpoint: string, 
    data: unknown, 
    params: Record<string, string | number> = {},
    customHeaders: Record<string, string> = {}
  ): Promise<T> {
    const fullPath = this.getEndpoint(page, endpoint, params);
    
    const token = localStorage.getItem('token') || import.meta.env.VITE_API_TOKEN;
    const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};

    const isFormData = data instanceof FormData;
    const headers: Record<string, string> = {
      'Accept-Language': this.language,
      ...authHeader,
      ...customHeaders,
    };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${this.baseUrl}${fullPath}`, {
      method: 'PUT',
      headers,
      body: isFormData ? (data as FormData) : JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : {} as T;
  }

  async delete<T>(
    page: string, 
    endpoint: string, 
    params: Record<string, string | number> = {},
    customHeaders: Record<string, string> = {}
  ): Promise<T> {
    const fullPath = this.getEndpoint(page, endpoint, params);
    
    const token = localStorage.getItem('token') || import.meta.env.VITE_API_TOKEN;
    const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};

    const headers: Record<string, string> = {
      'Accept-Language': this.language,
      ...authHeader,
      ...customHeaders,
    };

    const response = await fetch(`${this.baseUrl}${fullPath}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : {} as T;
  }
}

// Export a singleton instance with default config for backward compatibility
export const apiClient = new ApiClient();

export default apiClient;

