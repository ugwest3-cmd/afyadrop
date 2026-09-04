import express from "express";
import { config } from "./config.js";
import { router } from "./routes.js";

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(router);

app.listen(config.port, () => {
  console.log(`[afyadrop-ai] listening on :${config.port}`);
});
