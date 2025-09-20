import { Router } from "express";
import { editUser, getUser } from "../controllers/user.js";
import uploadLocal from "../utils/uploadLocal.js";
import manyRequestGuard from "../middlewares/manyRequestGuard.js";

const router = Router();

router.post("/edit", manyRequestGuard, uploadLocal.single("avatar"), editUser);
router.get("/get", manyRequestGuard, getUser);

export { router as userRoute };
