import IntaSend from "intasend-node";
import { config } from "./config.js";

// Initialize the IntaSend SDK
const intasend = new IntaSend(
  config.intasend.publishableKey,
  config.intasend.secretKey,
  config.intasend.isTest
);

export interface CreateCheckoutInput {
  amount: number;
  currency?: string;
  email: string;
  phone?: string;
  apiRef: string;
  redirectUrl?: string;
}

export async function createCheckout(input: CreateCheckoutInput): Promise<{ url: string; invoiceId: string }> {
  try {
    const collection = intasend.collection();
    const resp = await collection.charge({
      amount: input.amount,
      currency: input.currency ?? "USD",
      email: input.email,
      phone_number: input.phone,
      api_ref: input.apiRef,
      redirect_url: input.redirectUrl ?? config.intasend.callbackUrl,
    });
    
    if (!resp.url || !resp.invoice_id) {
      throw new Error("Invalid response from IntaSend checkout");
    }
    
    return { url: resp.url, invoiceId: resp.invoice_id };
  } catch (err: any) {
    throw new Error(`IntaSend checkout error: ${err.message || err}`);
  }
}

export async function getPaymentStatus(invoiceId: string): Promise<string> {
  try {
    const collection = intasend.collection();
    const resp = await collection.status(invoiceId);
    return resp?.invoice?.state?.toLowerCase() ?? "unknown";
  } catch (err: any) {
    throw new Error(`IntaSend status error: ${err.message || err}`);
  }
}
