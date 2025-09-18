import type { Request, Response } from "express";
import type { EditUserType } from "../types/user.js";
import ErrorType from "../types/error.js";
import db from "../lib/db.js";
import filterUser from "../utils/filter_user.js";

async function editUser(req: Request, res: Response) {
  try {
    const data = req.body as EditUserType;
    const userDetail = req._user;
    if (!userDetail) return res.status(400).send(ErrorType.InvalidToken);
    if (!data.name && !data.bio && !data.gender && !data.website) return res.status(400).send(ErrorType.DataRequired);

    // ✅ check extra fields
    const allowedKeys = ["name", "bio", "gender", "website"];
    const bodyKeys = Object.keys(data);
    const isValid = bodyKeys.every((key) => allowedKeys.includes(key));
    if (!isValid) return res.status(400).send(ErrorType.InvalidData);

    const user = await db.user.update({
      where: {
        username: userDetail.username,
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
