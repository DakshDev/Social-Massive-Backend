import db from "../lib/db.js";
import { type NextFunction, type Request, type Response } from "express";
import _env from "../config/env.js";
import jwt from "jsonwebtoken";
import filterUser from "../utils/filter_user.js";
import ErrorType from "../types/error.js";

async function getSimpleUser(username: string) {
  const user = await db.user.findUnique({
    where: { username },
  });
  if (!user) return null;
  const filter_user = await filterUser(user);
  return filter_user;
}

async function getUserBasedOnAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const { username } = req.params;
    const { token } = req.cookies;
    if (!username) return res.status(400).json({ error: "Username Required in API" });
    const lowerUsername = username.toLowerCase();

    if (token) {
      try {
        // login user
        const parseToken = jwt.verify(token, _env.jwtSecret) as any;
        if (!parseToken.username) return res.status(400).json({ error: "Invalid Token" });
        if (parseToken.username.toLowerCase() === lowerUsername) {
          const user = await db.user.findUnique({
            where: { username: lowerUsername },
            include: { posts: true, saved: true },
          });
          if (!user) return res.status(404).json({ error: ErrorType.UserNotFound });
          const filter_user = await filterUser(user);
          return res.status(200).json({ data: filter_user });
        } else {
          // Non-login User
          const user = await getSimpleUser(lowerUsername);
          if (!user) return res.status(404).json({ error: ErrorType.UserNotFound });
          return res.status(200).json({ data: user });
        }
      } catch (error) {
        return res.status(500).json({ error: "Server Error" });
      }
    } else {
      // Non-login User
      const user = await getSimpleUser(lowerUsername);
      if (!user) return res.status(404).json({ error: ErrorType.UserNotFound });
      return res.status(200).json({ data: user });
    }
  } catch (error) {
    console.error("🔴 Get User Based On Auth", error);
    return res.status(500).json({ error: "Server Error" });
  }
}

export default getUserBasedOnAuth;
