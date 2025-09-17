import { Router } from "express";
import { createAccount, isAlreadyExistUsername, loginAccount } from "../controllers/account.js";

const router = Router();

router.post("/create", createAccount);
router.post("/login", loginAccount);
router.post("/:username", isAlreadyExistUsername);

export { router as accountRoute };
