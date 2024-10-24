import express from "express";
import {
  startNewLifecycle,
  fetchLifecycles,
  updateLifecycle,
  fetchLifecycleById,
  startLifecycleNewStage,
  generatePdf,
  deleteAllLifecycles,
} from "../controllers/LifecycleController.js";
const router = express.Router();

router
  .post("/start-new-lifecycle", startNewLifecycle)
  .post("/:id/new-stage", startLifecycleNewStage)
  .get("/get-all-lifecycle", fetchLifecycles)
  .get("/getLifecycleById/:id", fetchLifecycleById)
  .put("/update/:id/:stageId", updateLifecycle)
  .get("/generate-pdf/:id/:stageId", generatePdf)
  .delete("/delete-all", deleteAllLifecycles);

export default router;
