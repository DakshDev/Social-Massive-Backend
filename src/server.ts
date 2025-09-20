import express from "express";
import cors from "cors";
import "dotenv/config";
import _env from "./config/env.js";
import cookieParser from "cookie-parser";
// Middlewares
import previewAPIS from "./middlewares/apis_route.js";
import authentication from "./middlewares/authentication.js";
// Routes
import { accountRoute } from "./routes/account.js";
import { userRoute } from "./routes/user.js";
import path from "path";

const app = express();
if (!_env.port) {
  console.log("🔴 env PORT Missing");
  process.exit(1);
}
const PORT = _env.port;

app.use(
  cors({
    origin: "*", // allow only this origin
    methods: ["GET", "POST", "PUT", "DELETE"], // optional
    credentials: true, // if you need to send cookies/auth headers
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static(path.resolve("public")));

import statusMonitor from "express-status-monitor";
app.use(statusMonitor());
app.get("/status", statusMonitor);

// Routes
app.use("/api/auth", accountRoute);
app.use("/api/user", authentication, userRoute);
app.use("/api", previewAPIS);

app.listen(PORT, () => console.log(`🟢 Server is running on PORT:${PORT}`));
