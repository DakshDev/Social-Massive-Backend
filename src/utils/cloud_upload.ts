import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import _env from "../config/env.js";

cloudinary.config({
  cloud_name: _env.cloud_name,
  api_key: _env.cloud_api_key,
  api_secret: _env.cloud_api_secret,
});

interface UploadImageProps {
  username: string;
  localFilePath: string;
  width: number;
  height: number;
  tag: string;
  purpose: string;
}

async function uploadImage({ localFilePath, height, width, username, purpose, tag }: UploadImageProps) {
  try {
    if (!localFilePath || !height || !width || !username || !purpose || !tag) return null;
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: username,
      format: "webp",
      transformation: { width: width, height: height, crop: "fill" },
      resource_type: "image",
      use_filename: true,
      unique_filename: true,
      tags: [tag, username],
      context: {
        uploadedBy: username,
        purpose: purpose,
      },
    });

    return result;
  } catch (error) {
    return null;
  } finally {
    await fs.unlink(localFilePath);
  }
}

export { uploadImage };
