import express from "express";
import cors from "cors";
import "dotenv/config";
import _env from "./config/env.js";
import cookieParser from "cookie-parser";
// Middlewares
import authentication from "./middlewares/authentication.js";
// Routes
import { accountRoute } from "./routes/account.js";
import { userRoute } from "./routes/user.js";
import { postRoute } from "./routes/post.js";

const app = express();
const PORT = _env.port || 3000;

if (!_env.cors_origin) {
  console.error("🔴 Allow CORS Origin ENV not defined");
  process.exit(1);
}
app.use(
  cors({
    origin: _env.cors_origin,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);
app.use(express.json({ limit: "26kb" }));
app.use(express.urlencoded({ extended: true, limit: "26kb" }));
app.use(cookieParser());

// Routes
app.use("/api/auth", accountRoute);
app.use("/api/post", authentication, postRoute);
app.use("/api/user", authentication, userRoute);
app.listen(PORT, () => console.log({ client: `🟢 ${_env.cors_origin}`, port: `🟢 ${PORT}` }));
