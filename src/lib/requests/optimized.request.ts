import { api } from 'src/boot/axios';
import { UrlPathsEnum } from '../enums/urlPaths.enum';

// Simple in-memory cache
class RequestCache {
  private cache = new Map<
    string,
    { data: any; timestamp: number; expiry: number }
  >();

  set(key: string, data: any, ttlMs = 300000) {
    // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttlMs,
    });
  }

  get(key: string) {
    const entry = this.cache.get(key);
    if (entry && Date.now() < entry.expiry) {
      return entry.data;
    }
    if (entry) {
      this.cache.delete(key); // Clean expired entries
    }
    return null;
  }

  clear() {
    this.cache.clear();
  }

  // Clean expired entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now >= entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

const requestCache = new RequestCache();

// Cleanup cache every 10 minutes
setInterval(() => requestCache.cleanup(), 10 * 60 * 1000);

// Pending requests to prevent duplicate calls
const pendingRequests = new Map<string, Promise<any>>();

export interface OptimizedRequestOptions {
  body?: Record<string, unknown> | any;
  params?: Record<string, unknown>;
  cache?: boolean;
  cacheTtl?: number; // Time to live in milliseconds
  timeout?: number; // Request timeout
  retries?: number; // Number of retries
  priority?: 'high' | 'normal' | 'low';
}

export async function optimizedRequestApi(
  url: UrlPathsEnum | string,
  method: 'get' | 'post' | 'put' | 'delete' = 'get',
  options: OptimizedRequestOptions = {}
) {
  const {
    body,
    params,
    cache = method === 'get', // Cache GET requests by default
    cacheTtl = 300000, // 5 minutes
    timeout = 30000, // 30 seconds
    retries = 2,
    priority = 'normal',
  } = options;

  // Create cache key for GET requests
  const cacheKey =
    method === 'get' ? `${url}:${JSON.stringify(params || {})}` : null;

  // Check cache first for GET requests
  if (cache && cacheKey && method === 'get') {
    const cached = requestCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Check if request is already pending
    const pending = pendingRequests.get(cacheKey);
    if (pending) {
      return pending;
    }
  }

  // Adaptive timeout based on connection
  const connection = (navigator as any).connection;
  let adaptiveTimeout = timeout;

  if (connection && ['slow-2g', '2g'].includes(connection.effectiveType)) {
    adaptiveTimeout = timeout * 2; // Double timeout for slow connections
  }

  const makeRequest = async (attempt = 1): Promise<any> => {
    try {
      const requestConfig: any = {
        timeout: adaptiveTimeout,
      };

      // Add compression headers for slow connections
      if (
        connection &&
        ['slow-2g', '2g', '3g'].includes(connection.effectiveType)
      ) {
        requestConfig.headers = {
          'Accept-Encoding': 'gzip, deflate, br',
          ...requestConfig.headers,
        };
      }

      let serverResponse;

      if (method === 'get') {
        serverResponse = await api.get(url, {
          params,
          ...requestConfig,
        });
      } else {
        serverResponse = await api[method](url, body, {
          params,
          ...requestConfig,
        });
      }

      const status = serverResponse.status;

      if (![200, 201, 204].includes(status)) {
        throw new Error('Request failed', {
          cause: serverResponse.data,
        });
      }

      const responseBody = serverResponse.data;

      // Cache successful GET requests
      if (cache && cacheKey && method === 'get') {
        requestCache.set(cacheKey, responseBody, cacheTtl);
        pendingRequests.delete(cacheKey);
      }

      return responseBody;
    } catch (error: any) {
      // Remove from pending requests on error
      if (cacheKey) {
        pendingRequests.delete(cacheKey);
      }

      // Retry logic for network errors
      if (
        attempt < retries &&
        (error.code === 'NETWORK_ERROR' ||
          error.code === 'ECONNABORTED' ||
          error.response?.status >= 500)
      ) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return makeRequest(attempt + 1);
      }

      throw error;
    }
  };

  // For GET requests, store the promise to prevent duplicates
  if (cache && cacheKey && method === 'get') {
    const requestPromise = makeRequest();
    pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  return makeRequest();
}

// Export cache control functions
export const cacheControl = {
  clear: () => requestCache.clear(),
  cleanup: () => requestCache.cleanup(),
  invalidate: (pattern: string) => {
    const keys = Array.from((requestCache as any).cache.keys());
    keys.forEach((key) => {
      if (key.includes(pattern)) {
        (requestCache as any).cache.delete(key);
      }
    });
  },
};

// Legacy function for backward compatibility
export async function requestApi(
  url: UrlPathsEnum | string,
  method: 'get' | 'post' | 'put' | 'delete' = 'get',
  payload: {
    body?: Record<string, unknown> | any;
    params?: Record<string, unknown>;
  } = {}
) {
  return optimizedRequestApi(url, method, {
    body: payload.body,
    params: payload.params,
  });
}
