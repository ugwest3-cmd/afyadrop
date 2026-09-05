import express from "express";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.js";
import { creditsRouter } from "./routes/credits.js";
import { qaRouter } from "./routes/qa.js";
import { documentsRouter } from "./routes/documents.js";
import { adminRouter } from "./routes/admin.js";

const app = express();
app.use(express.json({ limit: "15mb" })); // larger limit for document text ingestion

app.get("/health", (_req, res) => res.json({ ok: true, service: "afyadrop-backend", mode: "clinical-assistant" }));

app.use("/auth", authRouter);
app.use("/credits", creditsRouter);
app.use("/qa", qaRouter);
app.use("/documents", documentsRouter);
app.use("/admin", adminRouter);

app.listen(config.port, () => {
  console.log(`[afyadrop-backend] listening on :${config.port}`);
});
