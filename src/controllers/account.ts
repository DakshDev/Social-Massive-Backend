import { type Response, type Request } from "express";
import db from "../lib/db.js";
import bcrypt from "bcrypt";
import ErrorType from "../types/error.js";
import jwt from "jsonwebtoken";
import _env from "../config/env.js";
import type { UserType } from "../types/user.js";
import filterUser from "../utils/filter_user.js";

// Check Username Already Exist
async function isAlreadyExistUsername(req: Request, res: Response) {
  try {
    const { username } = req.params || {};
    if (!username) return res.status(400).send(ErrorType.DataRequired);
    const user = await db.user.findUnique({
      where: { username },
    });
    if (user) {
      return res.status(400).send(ErrorType.InvalidUsername);
    } else {
      return res.status(200).send();
    }
  } catch (error: unknown) {
    console.error(error);
    return res.status(500).send(ErrorType.ServerError);
  }
}

// Create Account
async function createAccount(req: Request, res: Response) {
  try {
    const { name, username, email, password, birth } = (req.body as UserType) || {};
    if (!name || !username || !email || !password || !birth) {
      return res.status(400).send(ErrorType.DataRequired);
    }

    const birthTime = new Date(birth);
    if (isNaN(birthTime.getTime())) return res.status(400).send(ErrorType.InvalidCredential);

    // 16+ Allowe Check
    const currentTime = new Date();
    let age = currentTime.getFullYear() - birthTime.getFullYear();
    const monthDiff = currentTime.getMonth() - birthTime.getMonth();
    const dayDiff = currentTime.getDate() - birthTime.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;
    if (age < 16) return res.status(400).send(ErrorType.InvalidAge);

    const result = await db.$transaction(async (tx) => {
      // Check User is Exist
      const isEmailTaken = await tx.user.findUnique({ where: { email } });
      const isUsernameTaken = await tx.user.findUnique({ where: { username } });
      if (isEmailTaken) throw new Error(ErrorType.InvalidEmail);
      if (isUsernameTaken) throw new Error(ErrorType.InvalidUsername);

      // Hash the Password
      const hash_password = await bcrypt.hash(password, 12);

      // Create the User
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hash_password,
          username,
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
      .send({ user: filterUser(result) });
  } catch (error: unknown) {
    if (error instanceof Error) {
      const { message } = error;
      switch (message) {
        case ErrorType.InvalidEmail:
          return res.status(400).send(message);
        case ErrorType.InvalidUsername:
          return res.status(400).send(message);
      }
    }
    console.error(error);
    return res.status(500).send(ErrorType.ServerError);
  }
}

// Login Account
async function loginAccount(req: Request, res: Response) {
  try {
    const { email, password } = req.body || {};
    console.log(req.body);
    if (!email || !password) return res.status(400).send(ErrorType.DataRequired);

    // Find Use
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return res.status(404).send(ErrorType.InvalidCredential);

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).send(ErrorType.InvalidCredential);

    const token = jwt.sign({ username: user.username }, _env.jwtSecret);
    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: _env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .send({ user: filterUser(user) });
  } catch (error: unknown) {
    console.error(error);
    return res.status(500).send(ErrorType.ServerError);
  }
}

export { createAccount, loginAccount, isAlreadyExistUsername };
