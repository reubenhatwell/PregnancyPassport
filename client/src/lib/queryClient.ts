import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { handleApiRequest } from "./apiAdapter";

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
  // Route all app API calls through the Supabase adapter
  const res = await handleApiRequest(method, url, data);
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    let url = queryKey[0] as string;
    const param = queryKey.length > 1 ? queryKey[1] : undefined;
    if (param !== undefined && param !== null) {
      if (url.includes("vital-stats") || url.includes("test-results") || url.includes("scans")) {
        url = `${url}?pregnancyId=${param}`;
      } else if (url.includes("immunisation-history")) {
        url = `${url}?pregnancyId=${param}`;
      } else if (url.includes("messages")) {
        url = `${url}?otherUserId=${param}`;
      } else if (url.includes("pregnancies/patient")) {
        url = `${url}?patientId=${param}`;
      }
    }
    const res = await handleApiRequest("GET", url);

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
