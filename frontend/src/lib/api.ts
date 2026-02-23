const BASE_URL = `http://localhost:${import.meta.env.VITE_API_PORT ?? "9999"}`;

export async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail ?? response.statusText);
  }

  return response.json() as Promise<T>;
}
