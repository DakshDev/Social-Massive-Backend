import type { Request, Response } from "express";
import type { EditUserType } from "../types/user.js";
import ErrorType from "../types/error.js";
import db from "../lib/db.js";
import filterUser from "../utils/filter_user.js";
import cloudinary from "../lib/cloudnary.js";
import fs from "fs/promises";

async function getUserInfo(req: Request, res: Response) {
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

async function editUserInfo(req: Request, res: Response) {
  try {
    const data = req.body as EditUserType;
    const file = req.file;
    const username = req._user?.username;

    if (file) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: username,
          format: "webp",
          transformation: { width: 200, height: 200, crop: "fill" },
          resource_type: "image",
          public_id: "avatar",
          overwrite: true,
          tags: ["avatar", username],
        });

        data.avatar = result.secure_url;
      } catch (error) {
        return res.status(520).json({ error: "Avatar Couldn't Upload" });
      } finally {
        await fs.unlink(file.path);
      }
    } else {
      if (!data.name && !data.bio && !data.gender && !data.website) return res.status(400).json({ error: ErrorType.FieldsRequired });
    }
    // ✅ check extra fields
    const allowedKeys = ["name", "bio", "gender", "website", "avatar"];
    const bodyKeys = Object.keys(data);
    const isValid = bodyKeys.every((key) => allowedKeys.includes(key));
    if (!isValid) return res.status(400).json({ error: ErrorType.InvalidData });

    const user = await db.user.update({
      where: {
        username: username,
      },
      data: {
        ...data,
      },
    });
    return res.status(200).json({ message: "Successfully Updated" });
  } catch (error) {
    console.error("🔴 Edit User Error", error);
    return res.status(500).json({ error: "Server Error" });
  }
}

export { editUserInfo, getUserInfo };
