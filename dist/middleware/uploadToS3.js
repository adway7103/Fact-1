var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});
const uploadToS3 = (bucketName, filePath) => __awaiter(void 0, void 0, void 0, function* () {
    const fileName = path.basename(filePath);
    const fileContent = yield fs.readFile(filePath);
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: fileContent,
        ContentType: "image/jpeg",
        // ACL: "public-read", // Makes the file publicly accessible
    });
    try {
        const response = yield s3Client.send(command);
        // console.log("File uploaded successfully:", response);
        return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    }
    catch (error) {
        console.error("Error uploading file to S3:", error);
        throw error;
    }
});
export { uploadToS3 };
