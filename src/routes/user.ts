import { Router } from "express";
import multerFileUploadLocal from "../utils/uploadLocal.js";
import manyRequestGuard from "../middlewares/manyRequestGuard.js";
import { editPost, getAllPosts, uploadPost } from "../controllers/user_post.js";
import { editUserInfo } from "../controllers/user_info.js";

const router = Router();

router.get("/post/all", manyRequestGuard, getAllPosts);
router.put(
  "userinfo/edit",
  manyRequestGuard,
  (req, res, next) => multerFileUploadLocal(req, res, next, "avatar"),
  editUserInfo
);
router.post("/post/upload", manyRequestGuard, uploadPost);
router.put("/post/edit/:id", manyRequestGuard, editPost);

export { router as userRoute };
