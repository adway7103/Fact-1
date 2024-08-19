import { addTask, getAllTasks, updateStatus, deleteTask } from "../controllers/TodoControllers.js";
import express from "express";
const router = express.Router();
router.get("/get-tasks", getAllTasks).post("/addTask", addTask).put("/updateStatus", updateStatus).delete("/deleteTask", deleteTask);
// router.post("/addTask2", addTask2).put("/updateStatus2", updateStatus2).delete("/deleteTask2", deleteTask2);
export default router;
