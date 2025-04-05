/**
 * Base API client configuration for making requests to internal API endpoints
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method?: RequestMethod;
  headers?: HeadersInit;
  body?: any;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
  params?: Record<string, any>;
}

interface NextFetchRequestConfig {
  revalidate?: number | false;
  tags?: string[];
}

export class APIError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'APIError';
  }
}

/**
 * Makes a fetch request to the API
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    cache,
    next,
    params,
  } = options;

  let url = endpoint.startsWith('http') 
    ? endpoint 
    : endpoint.startsWith('/api') 
      ? `${BASE_URL}${endpoint}` 
      : `${BASE_URL}/api${endpoint}`;

  // Add query parameters if provided
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += url.includes('?') ? `&${queryString}` : `?${queryString}`;
    }
  }

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    cache,
    next,
  };

  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, requestOptions);

  // Handle non-JSON responses
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    let errorMessage;

    try {
      if (isJson && errorText) {
        errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || `API Error: ${response.status}`;
      } else {
        errorMessage = errorText || `API Error: ${response.status}`;
      }
    } catch (e) {
      errorMessage = errorText || `API Error: ${response.status}`;
    }

    throw new APIError(response.status, errorMessage, errorData);
  }

  // Return the response based on content type
  if (isJson) {
    return await response.json() as T;
  } else if (contentType?.includes('text/')) {
    return await response.text() as unknown as T;
  } else {
    return await response.blob() as unknown as T;
  }
} 