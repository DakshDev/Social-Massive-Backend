import { Router } from "express";
import { editUser } from "../controllers/user.js";

const router = Router();

router.post("/edit", editUser);

export { router as userRoute };
