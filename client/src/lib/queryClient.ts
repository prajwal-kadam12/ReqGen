import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getApiUrl, getApiUrlWithMethod } from "@/config/api";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.role) {
        headers["x-user-role"] = user.role;
      }
      if (user.name) {
        headers["x-user-name"] = user.name;
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage");
    }
  }
  
  // Convert relative API URLs to full URLs for PHP backend
  const fullUrl = url.startsWith('/api/') ? getApiUrlWithMethod(url, method) : url;
  
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {};
    
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role) {
          headers["x-user-role"] = user.role;
        }
        if (user.name) {
          headers["x-user-name"] = user.name;
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage");
      }
    }
    
    // Convert query key to URL (handles both /api and PHP backend)
    const originalUrl = queryKey.join("/") as string;
    const fullUrl = originalUrl.startsWith('/api/') ? getApiUrl(originalUrl) : originalUrl;
    
    const res = await fetch(fullUrl, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
