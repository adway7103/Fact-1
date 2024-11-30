import { Router } from "express";
import fetchActivityLogs from "../controllers/LogsController.js";

const router = Router();

router.get("/activity-logs", fetchActivityLogs);

export default router;
