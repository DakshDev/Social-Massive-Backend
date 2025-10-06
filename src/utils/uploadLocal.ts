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

const uploadLocal = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
});

async function multerFileUploadLocal(req: Request, res: Response, next: NextFunction, fileName: string) {
  uploadLocal.single(fileName)(req, res, function (err) {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") return res.status(400).json(`File must be under 2MB`);
      if (err instanceof MulterError) return res.status(400).json({ error: err.message });
      return res.status(500).json({ error: "Unknown" });
    }
    next();
  });
}

export default multerFileUploadLocal;
