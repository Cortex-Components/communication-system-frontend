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

  async get<T>(page: string, endpoint: string, params: Record<string, string | number> = {}, queryParams: Record<string, string | number> = {}): Promise<T> {
    const fullPath = this.getEndpoint(page, endpoint, params);
    
    // Merge global language into query params
    const mergedQueryParams = { lang: this.language, ...queryParams };
    
    const query = new URLSearchParams(
      Object.entries(mergedQueryParams).map(([k, v]) => [k, String(v)])
    ).toString();
    
    const url = `${this.baseUrl}${fullPath}${query ? `?${query}` : ''}`;
    const headers: Record<string, string> = {
      'Accept-Language': this.language,
    };

    const token = localStorage.getItem('admin_token') || localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (fullPath.includes('/public/')) {
      headers['X-Tenant-ID'] = this.config.tenantId || '';
    }

    const response = await fetch(url, {
      headers
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : {} as T;
  }

  async post<T>(page: string, endpoint: string, data: unknown, params: Record<string, string | number> = {}, queryParams: Record<string, string | number> = {}): Promise<T> {
    const fullPath = this.getEndpoint(page, endpoint, params);

    // Merge query params if provided
    const query = new URLSearchParams(
      Object.entries(queryParams).map(([k, v]) => [k, String(v)])
    ).toString();

    const url = `${this.baseUrl}${fullPath}${query ? `?${query}` : ''}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept-Language': this.language,
    };

    const token = localStorage.getItem('admin_token') || localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (fullPath.includes('/public/')) {
      headers['X-Tenant-ID'] = this.config.tenantId || '';
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : {} as T;
  }

  async put<T>(page: string, endpoint: string, data: unknown, params: Record<string, string | number> = {}, queryParams: Record<string, string | number> = {}): Promise<T> {
    const fullPath = this.getEndpoint(page, endpoint, params);

    const query = new URLSearchParams(
      Object.entries(queryParams).map(([k, v]) => [k, String(v)])
    ).toString();

    const url = `${this.baseUrl}${fullPath}${query ? `?${query}` : ''}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept-Language': this.language,
    };

    const token = localStorage.getItem('admin_token') || localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (fullPath.includes('/public/')) {
      headers['X-Tenant-ID'] = this.config.tenantId || '';
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : {} as T;
  }

  async delete<T>(page: string, endpoint: string, data?: unknown, params: Record<string, string | number> = {}, queryParams: Record<string, string | number> = {}): Promise<T> {
    const fullPath = this.getEndpoint(page, endpoint, params);

    const query = new URLSearchParams(
      Object.entries(queryParams).map(([k, v]) => [k, String(v)])
    ).toString();

    const url = `${this.baseUrl}${fullPath}${query ? `?${query}` : ''}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept-Language': this.language,
    };

    const token = localStorage.getItem('admin_token') || localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (fullPath.includes('/public/')) {
      headers['X-Tenant-ID'] = this.config.tenantId || '';
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      body: data ? JSON.stringify(data) : undefined,
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
