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

const app = express();
const PORT = _env.port || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", accountRoute);
app.use("/api/user", authentication);
app.use("/api", previewAPIS);

app.listen(PORT, () => console.log(`🟢 Server is running on PORT:${PORT}`));
