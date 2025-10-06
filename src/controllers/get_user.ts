import db from "../lib/db.js";
import { type NextFunction, type Request, type Response } from "express";
import filterUser from "../utils/filter_user.js";

async function getUserInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const { username } = req.params;
    if (!username) return res.status(400).json({ error: "Username Required in API" });

    const user = await db.user.findUnique({
      where: { username: username.toLowerCase() },
    });
    if (!user) return res.status(404).json({ error: "user not found" });
    const filter_user = await filterUser(user);
    return res.status(200).json({ ...filter_user });
  } catch (error) {
    console.error("🔴 Get User Based On Auth", error);
    return res.status(500).json({ error: "Server Error" });
  }
}

export default getUserInfo;
