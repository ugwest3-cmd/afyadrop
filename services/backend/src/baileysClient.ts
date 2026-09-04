import { config } from "./config.js";

// Thin HTTP client the backend uses to ask the Baileys service to send messages.
export async function sendWhatsAppText(toE164: string, text: string): Promise<void> {
  try {
    await fetch(`${config.baileysUrl}/send`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-internal-secret": config.internalSecret },
      body: JSON.stringify({ to: toE164, text }),
    });
  } catch (err) {
    console.error("[backend] failed to send WhatsApp message:", (err as Error).message);
  }
}
