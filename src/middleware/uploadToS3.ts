import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs/promises";
import path from "path";
import "dotenv/config";

//configuration
//putobjectcommand
//configuration.send(command)

const s3Client = new S3Client({
  region: process.env.AWS_REGION, 
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID! || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! || "", 
  },
});

const uploadToS3 = async (bucketName: string, filePath: string): Promise<string> => {
  const fileName = path.basename(filePath);
  const fileContent = await fs.readFile(filePath);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: fileContent,
    ContentType: "image/jpeg", 
    // ACL: "public-read", // Makes the file publicly accessible
  });

  try {
    const response = await s3Client.send(command);
    // console.log("File uploaded successfully:", response);
    return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};

export { uploadToS3 };
