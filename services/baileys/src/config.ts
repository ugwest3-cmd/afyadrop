export const config = {
  port: Number(process.env.PORT ?? 4002),
  sessionPath: process.env.SESSION_STORE_PATH ?? "./auth_state",
  backendUrl: (process.env.MAIN_BACKEND_URL ?? "http://localhost:4000").replace(/\/$/, ""),
  internalSecret: process.env.INTERNAL_API_SECRET ?? "",
};
