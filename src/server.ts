import express from "express";
import cors from "cors";
import "dotenv/config";
import _env from "./config/env.js";
import cookieParser from "cookie-parser";
import statusMonitor from "express-status-monitor";
// Middlewares
import authentication from "./middlewares/authentication.js";
// Routes
import { accountRoute } from "./routes/account.js";
import { userRoute } from "./routes/user.js";
import { getUserRoute } from "./routes/get_user.js";

const app = express();
if (!_env.port) {
  console.log("🔴 env PORT Missing");
  process.exit(1);
}
const PORT = _env.port;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(statusMonitor());

// Routes
app.use("/api/auth", accountRoute);
app.use("/api/get", getUserRoute);
app.use("/api/user", authentication, userRoute);

app.listen(PORT, () => console.log(`🟢 Server is running on PORT:${PORT}`));
