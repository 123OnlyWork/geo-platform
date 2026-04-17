function resolveEnv(value: string | undefined, fallback: string): string {
  return value?.trim() ? value : fallback;
}

export const clientConfig = {
  appUrl: resolveEnv(process.env.NEXT_PUBLIC_APP_URL, "http://localhost:3000"),
  apiBaseUrl: resolveEnv(process.env.NEXT_PUBLIC_API_BASE_URL, "http://localhost:8000")
};