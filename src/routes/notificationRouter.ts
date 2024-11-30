import { Router } from "express";
import { notification } from "../controllers/notificationController.js";

const router = Router();

router.get("/notifications", notification);

export default router;
