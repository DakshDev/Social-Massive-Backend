import { Router } from "express";
import { editUser } from "../controllers/user.js";
import uploadLocal from "../utils/upload_local.js";
import RequestGuard from "../middlewares/request_guard.js";

const router = Router();

router.post("/edit", RequestGuard, uploadLocal.single("avatar"), editUser);

export { router as userRoute };
