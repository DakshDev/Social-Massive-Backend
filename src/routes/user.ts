import { Router } from "express";
import { editUser } from "../controllers/user_edit.js";
import multerFileUploadLocal from "../utils/uploadLocal.js";
import manyRequestGuard from "../middlewares/manyRequestGuard.js";
import { editPost, uploadPost } from "../controllers/user_post.js";

const router = Router();

router.put("/edit", manyRequestGuard, multerFileUploadLocal, editUser);
router.post("/upload/post", manyRequestGuard, uploadPost);
router.put("/upload/post/edit/:id", manyRequestGuard, editPost);

export { router as userRoute };
