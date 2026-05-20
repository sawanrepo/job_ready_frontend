const API_BASE_URL = import.meta.env.VITE_API_URL;

interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: FormData | string;
}

class ApiWrapper {
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
    config: RequestConfig & { url: string };
  }> = [];

  private async refreshToken(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);

    return data.access_token;
  }

  private processQueue(error: any, token?: string) {
    this.failedQueue.forEach(({ resolve, reject, config }) => {
      if (error) {
        reject(error);
      } else {
        const newConfig = {
          ...config,
          headers: {
            ...config.headers,
            'Authorization': `Bearer ${token}`,
          },
        };
        resolve(this.makeRequest(newConfig.url, newConfig));
      }
    });
    
    this.failedQueue = [];
  }

  private async makeRequest(url: string, config: RequestConfig): Promise<Response> {
    const token = localStorage.getItem('access_token');
    
    const headers = {
      ...config.headers,
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };

    return fetch(url, {
      ...config,
      headers,
      credentials: 'include',
    });
  }

  async request(endpoint: string, config: RequestConfig = {}): Promise<Response> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await this.makeRequest(url, config);
      
      if (response.status === 401) {
        if (this.isRefreshing) {
          // Queue the request while token is being refreshed
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject, config: { ...config, url } });
          });
        }

        this.isRefreshing = true;

        try {
          const newToken = await this.refreshToken();
          this.processQueue(null, newToken);
          
          // Retry the original request with new token
          const retryConfig = {
            ...config,
            headers: {
              ...config.headers,
              'Authorization': `Bearer ${newToken}`,
            },
          };
          
          return this.makeRequest(url, retryConfig);
        } catch (refreshError) {
          this.processQueue(refreshError);
          
          // Clear tokens and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_data');
          
          window.location.href = '/login';
          throw refreshError;
        } finally {
          this.isRefreshing = false;
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Convenience methods
  async get(endpoint: string, headers?: Record<string, string>) {
    return this.request(endpoint, { method: 'GET', headers });
  }

  async post(endpoint: string, body?: FormData | object, headers?: Record<string, string>) {
    const isFormData = body instanceof FormData;
    
    const finalHeaders = isFormData ? headers || {} : {
      'Content-Type': 'application/json',
      ...(headers || {}),
    };

    return this.request(endpoint, {
     method: 'POST',
    headers: finalHeaders,
    body: isFormData ? body : JSON.stringify(body),
    });

  }

  async put(endpoint: string, body?: FormData | object, headers?: Record<string, string>) {
    const isFormData = body instanceof FormData;
    
    return this.request(endpoint, {
      method: 'PUT',
      headers: {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...headers,
      },
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  async delete(endpoint: string, headers?: Record<string, string>) {
    return this.request(endpoint, { method: 'DELETE', headers });
  }
}

export const apiWrapper = new ApiWrapper();
