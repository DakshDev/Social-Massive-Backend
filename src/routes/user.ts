import { Router } from "express";
import multerFileUploadLocal from "../utils/uploadLocal.js";
import manyRequestGuard from "../middlewares/manyRequestGuard.js";
import { editPost, getAllPosts, uploadPost } from "../controllers/user_post.js";
import { getUserInfo, editUserInfo } from "../controllers/user_info.js";

const router = Router();

router.get("/post/all", manyRequestGuard, getAllPosts);
router.put(
  "/edit",
  manyRequestGuard,
  (req, res, next) => {
    multerFileUploadLocal(req, res, next, "avatar");
  },
  editUserInfo
);
router.post("/upload/post", manyRequestGuard, uploadPost);
router.put("/upload/post/edit/:id", manyRequestGuard, editPost);
router.get("/:username", getUserInfo);

export { router as userRoute };
