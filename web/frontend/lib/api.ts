import { supabase } from "./supabaseClient";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { authorization: `Bearer ${token}` } : {};
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(await authHeader()) },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", ...(await authHeader()) },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { cache: "no-store", headers: await authHeader() });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

export interface ProfileInput {
  full_name: string;
  country: string;
  qualification: string;
  licence_number: string;
}

export interface Country {
  code: string;
  name: string;
  dial: string;
  guidelineName: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string | null;
  country: string;
  qualification: string | null;
  licence_number: string | null;
  profile_completed: boolean;
  suspended: boolean;
}

export const api = {
  me: () => get<{ user: UserProfile | null }>("/auth/me"),
  completeProfile: (input: ProfileInput) => patch<{ ok: boolean; user: UserProfile }>("/auth/profile", input),
  countries: () => get<{ countries: Country[] }>("/auth/countries"),
  balance: (userId: string) =>
    get<{ balance_credits: number }>(`/credits/balance/${userId}`),
  purchase: (user_id: string, credits: number) =>
    post<{ payment_id: string; redirect_url: string }>("/credits/purchase", { user_id, credits }),
  ask: (question: string, imageUrl?: string) =>
    post<{ ok: boolean; answer: string; grounded: boolean; balance: number; low_balance: boolean }>("/qa/ask", {
      question,
      image_url: imageUrl,
    }),
};
