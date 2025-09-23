import type { Request, Response } from "express";
import db from "../lib/db.js";
import filterUser from "../utils/filter_user.js";

async function getPublicUser(req: Request, res: Response) {
  try {
    const { username } = req.params;
    if (!username) return res.status(400).json({ error: "Params Required" });
    const user = await db.user.findUnique({
      where: { username: username },
    });
    if (user === null) return res.status(404).json({ error: "user not found" });

    const filteredUser = filterUser(user);
    return res.status(200).json({ user: filteredUser });
  } catch (error) {
    console.error("🔴 Get Public User Error", error);
    return res.status(500).json({ error: "Server Error" });
  }
}

export default getPublicUser;
