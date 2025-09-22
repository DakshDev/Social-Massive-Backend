import { Router } from "express";
import { createAccount, usernameChecker, loginAccount, logoutAccount } from "../controllers/account.js";

const router = Router();

router.post("/create", createAccount);
router.post("/login", loginAccount);
router.post("/logout", logoutAccount);
router.post("/:username", usernameChecker);

export { router as accountRoute };
