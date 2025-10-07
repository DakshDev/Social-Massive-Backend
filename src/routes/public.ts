import { Router } from "express";
import { getUserInfo } from "../controllers/user_info.js";

const router = Router();

router.get("/userinfo/:username", getUserInfo);

export { router as publicRoute };
