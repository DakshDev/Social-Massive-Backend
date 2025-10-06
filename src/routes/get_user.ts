import { Router } from "express";
import getUserInfo from "../controllers/get_user.js";

const router = Router();

router.get("/:username", getUserInfo);

export { router as getUserRoute };
