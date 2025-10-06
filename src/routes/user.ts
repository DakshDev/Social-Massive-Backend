import { Router } from "express";
import { editUser } from "../controllers/user_edit.js";
import multerFileUploadLocal from "../utils/uploadLocal.js";
import manyRequestGuard from "../middlewares/manyRequestGuard.js";
import { editPost, uploadPost } from "../controllers/user_post.js";

const router = Router();

router.put(
  "/edit",
  manyRequestGuard,
  (req, res, next) => {
    multerFileUploadLocal(req, res, next, "avatar");
  },
  editUser
);
router.post(
  "/upload/post",
  manyRequestGuard,
  (req, res, next) => {
    multerFileUploadLocal(req, res, next, "thumnail");
  },
  uploadPost
);
router.put("/upload/post/edit/:id", manyRequestGuard, editPost);

export { router as userRoute };
