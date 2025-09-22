import { Router } from "express";
import { editUser, getUser } from "../controllers/user.js";
import multerFileUploadLocal from "../utils/uploadLocal.js";
import manyRequestGuard from "../middlewares/manyRequestGuard.js";
import { uploadPost } from "../controllers/upload.js";

const router = Router();

router.put("/edit", manyRequestGuard, multerFileUploadLocal, editUser);
router.get("/get", manyRequestGuard, getUser);
router.post("/upload/post", manyRequestGuard, uploadPost);

export { router as userRoute };
