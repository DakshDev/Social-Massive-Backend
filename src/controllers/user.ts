import type { Request, Response } from "express";
import type { EditUserType } from "../types/user.js";
import ErrorType from "../types/error.js";
import db from "../lib/db.js";
import filterUser from "../utils/filter_user.js";
import { uploadImage } from "../utils/cloud_upload.js";

async function editUser(req: Request, res: Response) {
  try {
    const data = req.body as EditUserType;
    const file = req.file;
    const username = req._user?.username;

    if (file) {
      const response = await uploadImage({
        height: 200,
        width: 200,
        localFilePath: file.path,
        username: username,
        purpose: "profile pic",
        tag: "avatar",
      });
      if (!response) return res.status(520).send(ErrorType.FileError);
      data.avatar = response?.secure_url;
    } else {
      if (!data.name && !data.bio && !data.gender && !data.website) return res.status(400).send(ErrorType.DataRequired);
    }
    // ✅ check extra fields
    const allowedKeys = ["name", "bio", "gender", "website", "avatar"];
    const bodyKeys = Object.keys(data);
    const isValid = bodyKeys.every((key) => allowedKeys.includes(key));
    if (!isValid) return res.status(400).send(ErrorType.InvalidData);

    const user = await db.user.update({
      where: {
        username: username,
      },
      data: {
        ...data,
      },
    });
    return res.status(200).send({ user: filterUser(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).send(ErrorType.ServerError);
  }
}

export { editUser };
