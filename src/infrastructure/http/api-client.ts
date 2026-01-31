// src/infrastructure/http/api-client.ts
// Cliente HTTP centralizado con configuración optimizada

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestConfig extends Omit<RequestInit, 'method' | 'body'> {
  params?: Record<string, string | number | boolean | string[] | undefined>;
  timeout?: number;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

class ApiClientError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiClientError';
    this.status = error.status;
    this.code = error.code;
    this.details = error.details;
  }
}

/**
 * Cliente HTTP optimizado para la aplicación
 * - Manejo automático de errores
 * - Timeout configurable
 * - Serialización automática de parámetros
 * - Tipado fuerte
 */
class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultHeaders: HeadersInit;

  constructor(config?: { baseUrl?: string; timeout?: number; headers?: HeadersInit }) {
    this.baseUrl = config?.baseUrl || '';
    this.defaultTimeout = config?.timeout || 30000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config?.headers,
    };
  }

  /**
   * Construye la URL con parámetros de query
   */
  private buildUrl(endpoint: string, params?: RequestConfig['params']): string {
    const url = new URL(endpoint, this.baseUrl || window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (Array.isArray(value)) {
          // Para arrays, unir con comas
          if (value.length > 0) {
            url.searchParams.set(key, value.join(','));
          }
        } else {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Ejecuta una petición HTTP con timeout
   */
  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    body?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const { params, timeout = this.defaultTimeout, ...fetchConfig } = config || {};
    const url = this.buildUrl(endpoint, params);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          ...this.defaultHeaders,
          ...fetchConfig.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
        ...fetchConfig,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData: ApiError;

        try {
          const errorBody = await response.json();
          errorData = {
            message: errorBody.error || errorBody.message || `HTTP Error ${response.status}`,
            status: response.status,
            code: errorBody.code,
            details: errorBody.details || errorBody,
          };
        } catch {
          errorData = {
            message: `HTTP Error ${response.status}: ${response.statusText}`,
            status: response.status,
          };
        }

        throw new ApiClientError(errorData);
      }

      // Manejar respuestas vacías (204 No Content)
      if (response.status === 204) {
        return {
          data: null as T,
          status: response.status,
          headers: response.headers,
        };
      }

      const data = await response.json();

      return {
        data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiClientError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiClientError({
            message: 'Request timeout',
            status: 408,
            code: 'TIMEOUT',
          });
        }

        throw new ApiClientError({
          message: error.message,
          status: 0,
          code: 'NETWORK_ERROR',
        });
      }

      throw new ApiClientError({
        message: 'Unknown error',
        status: 0,
        code: 'UNKNOWN',
      });
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const response = await this.request<T>('GET', endpoint, undefined, config);
    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.request<T>('POST', endpoint, body, config);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.request<T>('PUT', endpoint, body, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.request<T>('PATCH', endpoint, body, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const response = await this.request<T>('DELETE', endpoint, undefined, config);
    return response.data;
  }
}

// Instancia singleton del cliente API
export const apiClient = new ApiClient();

// Exportar tipos y clases
export { ApiClient, ApiClientError };
export type { ApiResponse, ApiError, RequestConfig };
