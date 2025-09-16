import express from "express";
import cors from "cors";
import "dotenv/config";
import _env from "./config/env.js";
// Routes Import
import { accountRoute } from "./routes/account.js";
import { defaultRoute } from "./middlewares/default_route.js";

const app = express();
const PORT = _env.port || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", accountRoute);
app.use("/api", defaultRoute);

app.listen(PORT, () => console.log(`🟢 Server is running on PORT:${PORT}`));
