import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

const maxImageSize = 2 * 1024 * 1024;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = (file, folder) => new Promise((resolve, reject) => {
  if (!file) {
    resolve(null);
    return;
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    reject(new Error("Cloudinary is not configured on the server."));
    return;
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder, resource_type: "image" },
    (error, result) => {
      if (error) reject(error);
      else resolve(result.secure_url);
    }
  );

  uploadStream.end(file.buffer);
});

export { cloudinary, maxImageSize };
