import { addTask, getAllTasks, updateStatus, deleteTask } from "../controllers/TodoControllers.js";
import express from "express";
const router = express.Router();
router.get("/get-tasks", getAllTasks).post("/addTask", addTask).put("/updateStatus", updateStatus).delete("/deleteTask", deleteTask);
export default router;
