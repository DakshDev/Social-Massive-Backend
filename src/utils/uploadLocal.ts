import multer, { MulterError } from "multer";
import path from "path";
import fs from "fs/promises";
import type { NextFunction, Request, Response } from "express";

const uploadsFolderPath = path.resolve("uploads");

async function ensureUploadPath() {
  try {
    await fs.mkdir(uploadsFolderPath, { recursive: true });
  } catch (err) {
    console.error("Error creating upload folder:", err);
    throw err;
  }
}
await ensureUploadPath();

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, uploadsFolderPath);
  },
  filename(req, file, callback) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileName = `${uniqueSuffix}${ext}`;
    callback(null, fileName);
  },
});

const uploadLocal = multer({ storage, limits: { fileSize: 1 * 1024 * 1024, files: 1 } });

async function multerFileUploadLocal(req: Request, res: Response, next: NextFunction) {
  uploadLocal.single("avatar")(req, res, function (err) {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json("File size must be under 1MB");
      }
      if (err instanceof MulterError) {
        return res.status(400).json(err.message);
      }
      throw new Error(err);
    }
    next();
  });
}

export default multerFileUploadLocal;
