import db from "../lib/db.js";
import { type NextFunction, type Request, type Response } from "express";
import _env from "../config/env.js";
import ErrorType from "../types/error.js";
import jwt from "jsonwebtoken";

async function authentication(req: Request, res: Response, next: NextFunction) {
  try {
    if (_env.NODE_ENV === "development") {
      const user = await db.user.findFirst();
      if (!user) return res.send(404).send("User Not Found in Dev Mode");
      req._user = { username: user.username };
      next();
    } else {
      const { token } = req.cookies;
      // verify Token
      if (!token) return res.status(401).send(ErrorType.TokenRequired);
      let tokenData;
      try {
        tokenData = jwt.verify(token, _env.jwtSecret) as { username: string };
      } catch (error) {
        throw new Error(ErrorType.InvalidToken);
      }
      if (!tokenData.username) return res.status(401).send(ErrorType.InvalidToken);
      const user = await db.user.findUnique({
        where: { username: tokenData.username },
      });
      if (!user) return res.status(401).send(ErrorType.InvalidCredential);
      req._user = { username: user.username };
      next();
    }
  } catch (error) {
    if (error instanceof Error) {
      const { message } = error;
      switch (message) {
        case ErrorType.InvalidToken:
          return res.status(401).send(message);
      }
    }
    console.error("🔴 Unknown Error:", error);
    res.status(500).send(ErrorType.ServerError);
  }
}

export default authentication;
