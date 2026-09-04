const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { cache: "no-store" });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

export interface RegisterInput {
  full_name: string;
  phone: string;
  qualification: string;
  licence_number: string;
}

export const api = {
  register: (input: RegisterInput) =>
    post<{ ok: boolean; user_id: string; message: string }>("/auth/register", input),
  verify: (phone: string, code: string) =>
    post<{ ok: boolean }>("/auth/verify", { phone, code }),
  balance: (userId: string) =>
    get<{ balance_credits: number }>(`/credits/balance/${userId}`),
  purchase: (user_id: string, credits: number) =>
    post<{ payment_id: string; redirect_url: string }>("/credits/purchase", { user_id, credits }),
};
