import { Router } from "express";
import { createAccount, usernameChecker, loginAccount } from "../controllers/account.js";

const router = Router();

router.post("/create", createAccount);
router.post("/login", loginAccount);
router.post("/:username", usernameChecker);

export { router as accountRoute };
