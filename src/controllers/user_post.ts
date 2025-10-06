import type { Request, Response } from "express";
import type { PostType } from "../types/user.js";
import db from "../lib/db.js";
import Busboy from "busboy";
import { pipeline } from "stream";
import { promisify } from "util";
import _env from "../config/env.js";
import cloudinary from "../lib/cloudnary.js";
import ErrorType from "../types/error.js";
import { Prisma } from "@prisma/client";
import getPostSize from "../utils/post_sizes.js";

const pump = promisify(pipeline);

async function uploadPost(req: Request, res: Response) {
  try {
    const data = {} as PostType;
    const username = req._user.username;
    const postSize = req.header("post-size") as "square" | "portrait" | "landscape";
    if (!postSize) return res.status(400).json({ error: "Size didn't Assigned in Header" });
    if (!(postSize == "landscape") && !(postSize == "portrait") && !(postSize == "square")) {
      return res.status(400).json({ error: `${postSize}: this size is not expected` });
    }

    const actualSize = getPostSize(postSize);
    if (!actualSize) return res.status(400).json({ error: "size is not define" });
    const busboy = Busboy({ headers: req.headers });
    let sourceURI: string;
    let thumnailURI: string;
    let filePromise: Promise<void> | null = null;

    // File handling
    busboy.on("file", async (fieldname: "post" | "thumnail", file, info) => {
      if (!(fieldname == "post" || fieldname == "thumnail")) {
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
            if (fieldname == "thumnail") {
              thumnailURI = result.secure_url;
            } else if (fieldname == "post") {
              sourceURI = result.secure_url;
            }
            resolve();
          }
        );

        pump(file, uploadStream).catch(() => {
          return res.status(520).json({ error: "File couldn't upload" });
        });
      });
    });

    // Handle text fields
    busboy.on("field", (name, value) => {
      (data as any)[name] = value;
    });

    // Finish
    busboy.on("finish", async () => {
      if (filePromise) await filePromise.catch((err) => res.status(520).json({ error: "File couldn't upload" }));
      await db.post.create({
        data: {
          sourceURI: sourceURI,
          thumnailURI: thumnailURI || null,
          title: data.title?.toLowerCase() ?? null,
          caption: data.caption ?? null,
          userId: req._user.id,
        },
      });
      return res.status(200).json({ message: "Post Has Been Uploaded" });
    });

    req.pipe(busboy);
  } catch (error) {
    if (error instanceof Error) return res.status(400).json({ error: error.message });
    console.error("🔴 Upload Post Error", error);
    return res.status(500).json({ error: "Server Error" });
  }
}

async function editPost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID Required in API" });
    let parseNumber = parseInt(id);
    if (isNaN(parseNumber)) return res.status(400).json({ error: "ID should be Number Type" });
    const { title, caption } = req.body || ({} as PostType);
    if (!title || !caption) return res.status(400).json({ error: ErrorType.FieldsRequired });

    const result = await db.post.update({
      where: { id: parseNumber },
      data: {
        caption,
        title: title.toLowerCase(),
      },
    });

    return res.status(200).json({ data: result });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(400).json({ error: error.code });
    }
    console.error("🔴 Edit Post Error", error);
    return res.status(500).json({ error: "Server Error" });
  }
}

async function getAllPosts(req: Request, res: Response) {
  try {
    const getPosts = await db.post.findMany({
      where: {
        userId: req._user.id,
      },
    });
    if (!getPosts) return res.status(404).json({ error: "posts not found" });
    return res.status(200).json(getPosts);
  } catch (error) {
    if (error instanceof Error) return res.status(500).json({ error: error.message });
    console.error("🔴 Get All Posts", error);
    return res.status(500).json({ error: "Server Error" });
  }
}

export { uploadPost, editPost, getAllPosts };
