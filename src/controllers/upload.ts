import type { Request, Response } from "express";
import type { PostType } from "../types/user.js";
import ErrorType from "../types/error.js";
import db from "../lib/db.js";
import Busboy from "busboy";
import { pipeline } from "stream";
import { promisify } from "util";
import _env from "../config/env.js";
import cloudinary from "../lib/cloudnary.js";

const pump = promisify(pipeline);

async function uploadPost(req: Request, res: Response) {
  try {
    const data = {} as PostType;
    const username = req._user.username;
    const postSize = req.header("post-size") as "square" | "portrait" | "landscape";
    if (!postSize) return res.status(400).send("Size not Assign in Header");
    let actualSize = { w: 0, h: 0 };

    let validSize = false;
    for (let i = 0; i < 3; i++) {
      if (postSize == "square") {
        actualSize.h = 1080;
        actualSize.w = 1080;
        validSize = true;
        break;
      }
      if (postSize == "portrait") {
        actualSize.h = 1350;
        actualSize.w = 1080;
        validSize = true;
        break;
      }
      if (postSize == "landscape") {
        actualSize.h = 608;
        actualSize.w = 1080;
        validSize = true;
        break;
      }
    }
    if (!validSize) return res.status(400).send("Invalid Post Size in Header");

    const busboy = Busboy({ headers: req.headers });
    let postURL: string;
    let postID: string;
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
            use_filename: false,
            unique_filename: true,
            transformation: [{ width: actualSize.w, height: actualSize.h, crop: "fill" }],
          },
          async (error, result) => {
            if (error) return reject(error);
            if (!result) return reject();
            postURL = result.secure_url;
            postID = result.public_id;
            resolve();
          }
        );

        pump(file, uploadStream).catch(() => {
          return res.status(500).send(ErrorType.FileError);
        });
      });
    });

    // Handle text fields
    busboy.on("field", (name, value, info) => {
      (data as any)[name] = value;
    });

    // Finish
    busboy.on("finish", async () => {
      try {
        if (filePromise) await filePromise.catch((err) => res.status(520).send(ErrorType.FileError));
        await db.post.create({
          data: {
            url: postURL,
            public: postID,
            title: data.title ?? null,
            caption: data.caption ?? null,
            userId: req._user.id,
          },
        });
        return res.end();
      } catch (err) {
        return res.status(500).send("Server Error");
      }
    });

    req.pipe(busboy);
  } catch (error) {
    if (error instanceof Error) {
      const { message } = error;
      return res.status(400).send(message);
    }
    console.error(error);
    return res.status(500).send("Server Error");
  }
}

export { uploadPost };
