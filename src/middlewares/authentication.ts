import db from "../lib/db.js";
import { type NextFunction, type Request, type Response } from "express";
import _env from "../config/env.js";
import jwt from "jsonwebtoken";

async function authentication(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.cookies;
    // verify Token
    if (!token) return res.status(401).send("Token Required");
    let tokenData;
    try {
      tokenData = jwt.verify(token, _env.jwtSecret) as { username: string };
    } catch (error) {
      return res.status(401).send("Invalid Token");
    }
    if (!tokenData.username) return res.status(401).send("Invalid Token");
    const user = await db.user.findUnique({
      where: { username: tokenData.username },
    });
    if (!user) return res.status(401).send("Invalid Token Credential");
    req._user = { username: user.username, id: user.id };
    next();
  } catch (error) {
    console.error("🔴 Authentication Error:", error);
    res.status(500).send("Server Error");
  }
}

export default authentication;
