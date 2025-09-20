import multer from "multer";
import path from "path";
import fs from "fs/promises";

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

const uploadLocal = multer({ storage });

export default uploadLocal;
