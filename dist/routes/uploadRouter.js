import { Router } from "express";
import { uploadFile } from "../controllers/uploadController.js";
import upload from "../middleware/multerMiddleware.js";
const router = Router();
router.post("/upload", upload.single("file"), uploadFile);
export default router;
