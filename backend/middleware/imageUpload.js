import multer from "multer";
import { maxImageSize } from "../utils/cloudinary.js";

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxImageSize },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith("image/")) {
      callback(null, true);
    } else {
      callback(new Error("Only image files are allowed."));
    }
  },
});

export default imageUpload;
