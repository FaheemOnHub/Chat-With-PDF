const cloudinary = require("cloudinary").v2;
import * as dotenv from "dotenv";
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadPDF(file) {
  try {
    const result = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
      folder: "pdfs",
    });
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading PDF to Cloudinary:", error);
    throw error;
  }
}

export default uploadPDF;
