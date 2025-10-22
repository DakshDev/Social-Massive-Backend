import { Router } from "express";
import manyRequestGuard from "../middlewares/manyRequestGuard.js";
import { editPost, getAllPosts, uploadPost } from "../controllers/user_post.js";

const router = Router();

router.get("/all", manyRequestGuard, getAllPosts);
router.post("/upload", manyRequestGuard, uploadPost);
router.put("/edit/:id", manyRequestGuard, editPost);

export { router as postRoute };
