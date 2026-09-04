import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  type WASocket,
} from "@whiskeysockets/baileys";
import pino from "pino";
import { config } from "./config.js";

const logger = pino({ level: process.env.LOG_LEVEL ?? "warn" });

let sock: WASocket | null = null;
let qr: string | null = null;
let connected = false;

export function getQr(): string | null {
  return qr;
}
export function isConnected(): boolean {
  return connected;
}

export async function startSocket(onMessage: (fromE164: string, text: string) => Promise<void>): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    generateHighQualityLinkPreview: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr: qrCode } = update;
    if (qrCode) {
      qr = qrCode;
      console.log("[baileys] QR ready — scan with the main business phone.");
    }
    if (connection === "open") {
      connected = true;
      qr = null;
      console.log("[baileys] connected to WhatsApp");
    }
    if (connection === "close") {
      connected = false;
      const statusCode = (lastDisconnect?.error as { output?: { statusCode?: number } })?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`[baileys] connection closed (status ${statusCode}). reconnect=${shouldReconnect}`);
      if (shouldReconnect) {
        setTimeout(() => void startSocket(onMessage), 2000);
      } else {
        console.log("[baileys] logged out — delete the auth_state volume and re-pair via QR.");
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const msg of messages) {
      if (msg.key.fromMe) continue;
      const jid = msg.key.remoteJid;
      if (!jid || jid.endsWith("@g.us") || jid === "status@broadcast") continue; // skip groups/status
      const text =
        msg.message?.conversation ??
        msg.message?.extendedTextMessage?.text ??
        "";
      if (!text.trim()) continue; // text-only MVP
      const e164 = `+${jid.replace(/@s\.whatsapp\.net$/, "")}`;
      try {
        await onMessage(e164, text.trim());
      } catch (err) {
        console.error("[baileys] onMessage error:", (err as Error).message);
      }
    }
  });
}

export async function sendText(toE164: string, text: string): Promise<void> {
  if (!sock || !connected) throw new Error("WhatsApp socket not connected");
  const jid = `${toE164.replace(/\D/g, "")}@s.whatsapp.net`;
  await sock.sendMessage(jid, { text });
}
