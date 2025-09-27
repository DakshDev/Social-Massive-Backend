import { Router } from "express";
import getUserBasedOnAuth from "../controllers/get_user.js";

const router = Router();

router.get("/:username", getUserBasedOnAuth);

export { router as getUserRoute };
