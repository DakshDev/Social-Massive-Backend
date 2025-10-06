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

const app = express();
if (!_env.port) {
  console.log("🔴 env PORT Missing");
  process.exit(1);
}
const PORT = _env.port;

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json({ limit: "26kb" }));
app.use(express.urlencoded({ extended: true, limit: "26kb" }));
app.use(cookieParser());

// Routes
app.use("/api/auth", accountRoute);
app.use("/api/user", authentication, userRoute);

app.listen(PORT, () => console.log(`🟢 Server is running on PORT:${PORT}`));
