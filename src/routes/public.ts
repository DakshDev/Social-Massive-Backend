import { Router } from "express";
import getPublicUser from "../controllers/public.js";

const router = Router();

router.get("/get/:username", getPublicUser);

export { router as publicRoute };
