import { type Response, type Request } from "express";
import db from "../lib/db.js";
import bcrypt from "bcrypt";
import ErrorType from "../types/error.js";
import jwt from "jsonwebtoken";
import _env from "../config/env.js";
import type { UserCreateType } from "../types/user.js";
import filterUser from "../utils/filter_user.js";

// Check Username Already Exist
async function isAlreadyExistUsername(req: Request, res: Response) {
  try {
    const { username } = req.params;
    if (!username) throw new Error(ErrorType.DataRequired);
    const user = await db.user.findUnique({
      where: { username },
    });
    if (user) {
      return res.status(400).json({ valid: false });
    } else {
      return res.status(200).json({ valid: true });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      const { message } = error;
      switch (message) {
        case ErrorType.DataRequired:
          res.status(400).send(message);
          break;
        default:
          console.error(error);
          return res.status(500).send(ErrorType.ServerError);
      }
    }
  }
}

// Create Account
async function createAccount(req: Request, res: Response) {
  try {
    const { name, username, email, password } = req.body as UserCreateType;
    if (!name || !username || !email || !password) {
      throw new Error(ErrorType.DataRequired);
    }

    const result = await db.$transaction(async (tx) => {
      // Check User is Exist
      const isEmailTaken = await tx.user.findUnique({ where: { email } });
      const isUsernameTaken = await tx.user.findUnique({ where: { username } });
      if (isEmailTaken) throw new Error(ErrorType.InvalidEmail);
      if (isUsernameTaken) throw new Error(ErrorType.InvalidUsername);

      // Hashing the Password
      const hash_password = await bcrypt.hash(password, 12);

      // Creating the User
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hash_password,
          username,
        },
      });

      return user;
    });

    const token = jwt.sign({ username: result.username }, _env.jwtSecret);
    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: _env.NODE_ENV === "development",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(201)
      .send({ user: filterUser(result) });
  } catch (error: unknown) {
    if (error instanceof Error) {
      const { message } = error;
      switch (message) {
        case ErrorType.DataRequired:
          res.status(400).send(message);
          break;
        case ErrorType.InvalidEmail:
          res.status(400).send(message);
          break;
        case ErrorType.InvalidUsername:
          res.status(400).send(message);
          break;
        default:
          console.error(error);
          return res.status(500).send(ErrorType.ServerError);
      }
    }
  }
}

// Login Account
async function loginAccount(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new Error(ErrorType.DataRequired);

    // Find Use
    const user = await db.user.findUnique({ where: { email } });
    if (!user) throw new Error(ErrorType.InvalidCredential);

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error(ErrorType.InvalidCredential);

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
    if (error instanceof Error) {
      const { message } = error;
      switch (message) {
        case ErrorType.DataRequired:
          res.status(400).send(message);
          break;
        case ErrorType.InvalidCredential:
          res.status(400).send(message);
          break;
        default:
          console.error(error);
          return res.status(500).send(ErrorType.ServerError);
      }
    }
  }
}

export { createAccount, loginAccount, isAlreadyExistUsername };
