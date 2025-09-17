import { type Response, type Request } from "express";
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import ErrorType from "../types/error.js";
import jwt from "jsonwebtoken";
import _env from "../config/env.js";

interface UserInterface {
  name: string;
  username: string;
  email: string;
  password: string;
  birth: Date;
  gender: "male" | "female" | "other";
}

// Check Username Already Exist
async function isAlreadyExistUsername(req: Request, res: Response) {
  try {
    const { username } = req.params;
    if (!username) throw new Error(ErrorType.DataRequired);
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (user) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(404).json({ exists: false });
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
    const { name, username, email, gender, birth, password } = req.body as UserInterface;
    if (!name || !username || !email || !birth || !password) {
      throw new Error(ErrorType.DataRequired);
    }

    // Valid Birth
    const birthDate = new Date(birth);
    if (isNaN(birthDate.getTime())) throw new Error(ErrorType.InvalidCreation);

    const result = await prisma.$transaction(async (tx) => {
      // Check User is Exist
      const isEmailTaken = await tx.user.findUnique({ where: { email } });
      const isUsernameTaken = await tx.user.findUnique({ where: { username } });
      if (isEmailTaken || isUsernameTaken) throw new Error(ErrorType.InvalidCreation);

      // Hashing the Password
      const hash_password = await bcrypt.hash(password, 12);

      // Creating the User
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hash_password,
          username,
          birth: birthDate,
          gender,
        },
      });

      return { ...user, password: null };
    });

    const token = jwt.sign({ username: result.username }, _env.jwtSecret);
    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: _env.NODE_ENV === "development",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .send({ user: "result" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      const { message } = error;
      switch (message) {
        case ErrorType.DataRequired:
          res.status(400).send(message);
          break;
        case ErrorType.InvalidCreation:
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
    const { email, password } = req.body as UserInterface;
    if (!email || !password) throw new Error(ErrorType.DataRequired);

    // Find Use
    const user = await prisma.user.findUnique({ where: { email } });
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
      .send({ user: "result" });
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
