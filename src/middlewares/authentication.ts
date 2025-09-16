import prisma from "../lib/prisma.js";
import { type NextFunction, type Request, type Response } from "express";
import _env from "../config/env.js";
import ErrorType from "../types/error.js";

async function authentication(req: Request, res: Response, next: NextFunction) {
  try {
    if (_env.NODE_ENV === "development") {
      next();
    } else {
      const { username, email } = req.body;
      if (!username || !email) throw new Error(ErrorType.DataRequired);
    }
  } catch (error) {
    if (error instanceof Error) {
      const { message } = error;
      switch (message) {
        case ErrorType.DataRequired:
          res.status(400).send(message);
          break;

        default:
          console.error("🔴 Authentication Error:", error);
          res.status(500).send(ErrorType.ServerError);
      }
    }
  }
}

export default authentication;
