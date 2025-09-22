import { v2 as cloudinary } from "cloudinary";
import _env from "../config/env.js";

cloudinary.config({
  cloud_name: _env.cloud_name,
  api_key: _env.cloud_api_key,
  api_secret: _env.cloud_api_secret,
});

export default cloudinary;
