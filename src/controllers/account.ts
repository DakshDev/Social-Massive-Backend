import { type Response, type Request } from "express";
import db from "../lib/db.js";
import bcrypt from "bcrypt";
import ErrorType from "../types/error.js";
import jwt from "jsonwebtoken";
import _env from "../config/env.js";
import type { UserType } from "../types/user.js";

// Username Checker
async function usernameChecker(req: Request, res: Response) {
  try {
    const { username } = req.params || {};
    if (!username) return res.status(400).json({ error: "Username Required in API" });
    const user = await db.user.findUnique({
      where: { username: username.toLowerCase() },
    });
    if (user) {
      return res.status(400).json({ error: "already exist username" });
    } else {
      return res.status(200).json({ message: "username is valid" });
    }
  } catch (error: unknown) {
    console.error("🔴 Username Checker Error", error);
    return res.status(500).json({ error: "Server Error" });
  }
}

// Create Account
async function createAccount(req: Request, res: Response) {
  try {
    const { name, username, email, password, birth } = (req.body as UserType) || {};
    if (!name || !username || !email || !password || !birth) {
      return res.status(400).json({ error: ErrorType.FieldsRequired });
    }

    const birthTime = new Date(birth);
    if (isNaN(birthTime.getTime())) return res.status(400).json({ error: "Date Of Birth is Invalid" });

    // 16+ Allowe Check
    const currentTime = new Date();
    let age = currentTime.getFullYear() - birthTime.getFullYear();
    const monthDiff = currentTime.getMonth() - birthTime.getMonth();
    const dayDiff = currentTime.getDate() - birthTime.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;
    if (age < 16) return res.status(400).json({ error: "User must be at least 16 years old" });

    const result = await db.$transaction(async (tx) => {
      // Check User is Exist
      const isUsernameTaken = await tx.user.findUnique({ where: { username: username.toLowerCase() } });
      if (isUsernameTaken) throw new Error(ErrorType.InvalidUsername);
      const isEmailTaken = await tx.user.findUnique({ where: { email: email.toLowerCase() } });
      if (isEmailTaken) throw new Error(ErrorType.InvalidEmail);

      // Hash the Password
      const hash_password = await bcrypt.hash(password, 12);

      // Create the User
      const user = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hash_password,
          username: username.toLowerCase(),
          birth: birthTime,
        },
      });
      return user;
    });

    const token = jwt.sign({ username: result.username }, _env.jwtSecret);
    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: _env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(201)
      .json({ message: "Account Created successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      const { message } = error;
      switch (message) {
        case ErrorType.InvalidEmail:
          return res.status(400).json({ error: message });
        case ErrorType.InvalidUsername:
          return res.status(400).json({ error: message });
      }
    }
    console.error("🔴 Create Account Error", error);
    return res.status(500).json({ error: "Server Error" });
  }
}

// Login Account
async function loginAccount(req: Request, res: Response) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: ErrorType.FieldsRequired });

    // Find Use
    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(404).json({ error: ErrorType.UserNotFound });

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ error: ErrorType.InvalidCredential });

    const token = jwt.sign({ username: user.username }, _env.jwtSecret);
    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: _env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({ message: "Account Login successfully" });
  } catch (error: unknown) {
    console.error("🔴 Account Login Error", error);
    return res.status(500).json({ error: "Server Error" });
  }
}

// Logout
async function logoutAccount(req: Request, res: Response) {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: _env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
    })
    .json({ message: "Logout" });
}

export { createAccount, loginAccount, usernameChecker, logoutAccount };
