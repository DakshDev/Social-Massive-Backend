import db from "../lib/db.js";
import { type NextFunction, type Request, type Response } from "express";
import _env from "../config/env.js";
import ErrorType from "../types/error.js";
import jwt from "jsonwebtoken";

async function authentication(req: Request, res: Response, next: NextFunction) {
  try {
    if (_env.NODE_ENV === "development") {
      const user = await db.user.findFirst({
        include: { followers: true, following: true, posts: true, saved: true },
      });
      if (!user) {
        return res.send(404).send("User Not Found: Authentication in Development Mode");
      }
      req._user = user;
      next();
    } else {
      const { token } = req.cookies;
      // verify Token
      if (!token) throw new Error(ErrorType.TokenRequired);
      let tokenData;
      try {
        tokenData = jwt.verify(token, _env.jwtSecret) as { username: string };
      } catch (error) {
        throw new Error(ErrorType.InvalidToken);
      }
      if (!tokenData.username) throw new Error(ErrorType.InvalidToken);

      // Find User
      const user = await db.user.findUnique({
        where: { username: tokenData.username },
        include: { followers: true, following: true, posts: true, saved: true },
      });
      if (!user) throw new Error(ErrorType.InvalidCredential);
      req._user = user;
      next();
    }
  } catch (error) {
    if (error instanceof Error) {
      const { message } = error;
      switch (message) {
        case ErrorType.TokenRequired:
          res.status(401).send(message);
          break;
        case ErrorType.InvalidToken:
          res.status(401).send(message);
          break;
        case ErrorType.InvalidCredential:
          res.status(401).send(message);
          break;
        default:
          console.error("🔴 Authentication Middleware:", error);
          res.status(500).send(ErrorType.ServerError);
      }
    }
  }
}

export default authentication;
