import express from "express";
import { config } from "./config.js";
import { startSocket, sendText, getQr, isConnected } from "./session.js";

async function forwardToBackend(fromE164: string, text: string): Promise<void> {
  const res = await fetch(`${config.backendUrl}/qa/from-whatsapp`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ phone: fromE164, text }),
  });
  if (!res.ok) {
    console.error("[baileys] backend error:", res.status, await res.text());
  }
}

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "afyadrop-baileys", connected: isConnected() });
});

// Returns the current QR (as a string) for pairing, if not yet connected.
app.get("/qr", (_req, res) => {
  const qr = getQr();
  if (connectedOrNoQr()) {
    res.json({ connected: isConnected(), qr: null });
    return;
  }
  res.json({ connected: false, qr });
});

function connectedOrNoQr(): boolean {
  return isConnected() || getQr() === null;
}

// Internal endpoint the backend uses to send messages.
app.post("/send", async (req, res) => {
  const provided = req.header("x-internal-secret");
  if (!config.internalSecret || provided !== config.internalSecret) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  const { to, text } = req.body ?? {};
  if (!to || typeof text !== "string") {
    res.status(400).json({ error: "to and text are required" });
    return;
  }
  try {
    await sendText(String(to), text);
    res.json({ ok: true });
  } catch (err) {
    res.status(502).json({ error: (err as Error).message });
  }
});

app.listen(config.port, () => {
  console.log(`[afyadrop-baileys] http on :${config.port}`);
  startSocket(forwardToBackend).catch((err) => {
    console.error("[baileys] failed to start socket:", (err as Error).message);
    process.exit(1);
  });
});
