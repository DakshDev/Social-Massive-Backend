import type { Request, Response } from "express";
import type { Post } from "../types/user.js";
import ErrorType from "../types/error.js";
import db from "../lib/db.js";
import filterUser from "../utils/filter_user.js";
import { v2 as cloudinary } from "cloudinary";
import Busboy from "busboy";
import { pipeline } from "stream";
import { promisify } from "util";
import _env from "../config/env.js";

cloudinary.config({
  cloud_name: _env.cloud_name,
  api_key: _env.cloud_api_key,
  api_secret: _env.cloud_api_secret,
});

const pump = promisify(pipeline);

async function uploadPost(req: Request, res: Response) {
  try {
    const data = {} as Post;
    const username = req._user.username;
    const postType = req.header("post-type") as "video" | "image";
    const postSize = req.header("post-size") as "square" | "portrait" | "landscape";

    if (postType === "image" || postType === "video") {
      // 1080 x 1080 == square
      // 1080 x 608 == landscape
      // 1080 x 1350 == portrait
      let sizes = ["landscape", "portrait", "square"];
      const result = sizes.map((each) => {
        if (postSize.includes(each)) {
          return true;
        }
        return null;
      });
      if (!result) return res.status(400).send(ErrorType.InvalidData);
    } else {
      return res.status(400).send(ErrorType.InvalidData);
    }
    const busboy = Busboy({ headers: req.headers });
    let avatarUrl: string | undefined;
    let filePromise: Promise<void> | null = null;

    // File handling
    busboy.on("file", async (fieldname, file, info) => {
      if (fieldname !== "post") {
        file.resume();
        return;
      }

      const { mimeType } = info;
      const resourceType = mimeType.startsWith("video") ? "video" : "image";

      // Direct Cloudinary upload stream
      filePromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: username,
            resource_type: resourceType,
            transformation: [{ width: 1080, height: 1080, crop: "fill" }],
          },
          async (error, result) => {
            if (error) return reject(error);
            avatarUrl = result?.secure_url;
            resolve();
          }
        );

        pump(file, uploadStream).catch(() => {
          return res.status(500).send(ErrorType.FileError);
        });
      });
    });

    // Handle text fields
    busboy.on("field", (name, value) => {
      (data as any)[name] = value;
    });

    // Finish
    busboy.on("finish", async () => {
      try {
        if (filePromise)
          await filePromise.catch((err) => res.status(500).send(ErrorType.FileError));
        console.log("Fields:", data);
        console.log("Post:", avatarUrl);
        return res.end();
      } catch (err) {
        return res.status(500).send(ErrorType.ServerError);
      }
    });

    req.pipe(busboy);
  } catch (error) {
    console.error(error);
    return res.status(500).send(ErrorType.ServerError);
  }
}

export { uploadPost };
