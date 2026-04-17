import { clientConfig } from "@/lib/config";

interface RequestOptions extends RequestInit {
  path: string;
}

async function request<T>({ path, ...options }: RequestOptions): Promise<T> {
  const response = await fetch(`${clientConfig.apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API error ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>({ path, method: "GET" })
};