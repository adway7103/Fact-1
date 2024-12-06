import { Request, Response } from "express";

import { uploadToS3 } from "../middleware/uploadToS3.js";
import path from "path";
import fs from "fs/promises";

const uploadFile = async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  const bucketName = "myfactory-assets"; 
  const key = path.basename(file.path); 
  const filePath = file.path;

  try {
    const fileUrl = await uploadToS3(bucketName, filePath);

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      contentUrl: fileUrl,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ success: false, message: "Error uploading file" });
  } finally {
    await fs.unlink(filePath);
  }
};

export { uploadFile };
