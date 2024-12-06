var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { uploadToS3 } from "../middleware/uploadToS3.js";
import path from "path";
import fs from "fs/promises";
const uploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const fileUrl = yield uploadToS3(bucketName, filePath);
        res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            contentUrl: fileUrl,
        });
    }
    catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ success: false, message: "Error uploading file" });
    }
    finally {
        yield fs.unlink(filePath);
    }
});
export { uploadFile };
