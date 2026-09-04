import { config } from "./config.js";

// Minimal PesaPal v3 client. Sandbox base URL by default.

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 10_000) return cachedToken.token;

  const res = await fetch(`${config.pesapal.baseUrl}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      consumer_key: config.pesapal.consumerKey,
      consumer_secret: config.pesapal.consumerSecret,
    }),
  });
  if (!res.ok) throw new Error(`PesaPal auth ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { token?: string; expiryDate?: string };
  if (!data.token) throw new Error("PesaPal auth: no token");
  cachedToken = {
    token: data.token,
    expiresAt: data.expiryDate ? new Date(data.expiryDate).getTime() : now + 4 * 60_000,
  };
  return data.token;
}

export interface CreateOrderInput {
  paymentId: string;      // our internal payment uuid (merchant reference)
  amountUgx: number;
  description: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}

export async function createPesapalOrder(input: CreateOrderInput): Promise<{ redirectUrl: string; trackingId: string }> {
  const token = await getToken();
  const res = await fetch(`${config.pesapal.baseUrl}/api/Transactions/SubmitOrderRequest`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({
      id: input.paymentId,
      currency: "UGX",
      amount: input.amountUgx,
      description: input.description,
      callback_url: config.pesapal.callbackUrl,
      notification_id: config.pesapal.ipnId,
      billing_address: {
        email_address: input.email ?? "",
        phone_number: input.phone ?? "",
        first_name: input.firstName ?? "",
        last_name: input.lastName ?? "",
        country_code: "UG",
      },
    }),
  });
  if (!res.ok) throw new Error(`PesaPal order ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { redirect_url?: string; order_tracking_id?: string };
  if (!data.redirect_url || !data.order_tracking_id) throw new Error("PesaPal order: incomplete response");
  return { redirectUrl: data.redirect_url, trackingId: data.order_tracking_id };
}

export async function getTransactionStatus(trackingId: string): Promise<string> {
  const token = await getToken();
  const url = `${config.pesapal.baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(trackingId)}`;
  const res = await fetch(url, { headers: { accept: "application/json", authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`PesaPal status ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { payment_status_description?: string; status_code?: number };
  return (data.payment_status_description ?? "").toLowerCase();
}
