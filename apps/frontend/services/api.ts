const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

export default {
  get: (path: string) => request(path),
  post: (path: string, body: any) =>
    request(path, {
      method: "POST",
      body: JSON.stringify(body)
    })
};