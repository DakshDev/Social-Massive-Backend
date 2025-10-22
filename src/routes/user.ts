import { Router } from "express";
import multerFileUploadLocal from "../utils/uploadLocal.js";
import manyRequestGuard from "../middlewares/manyRequestGuard.js";
import { editUserInfo, getUserInfo } from "../controllers/user_info.js";

const router = Router();

router.get("/:username", getUserInfo);
router.put("/edit", manyRequestGuard, (req, res, next) => multerFileUploadLocal(req, res, next, "avatar"), editUserInfo);

export { router as userRoute };
