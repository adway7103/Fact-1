import express from "express";
import {
  startNewLifecycle,
  fetchProductions,
} from "../controllers/LifecycleController.js";
const router = express.Router();

router
  .post("/start-new-lifecycle", startNewLifecycle)
  .get("/get-all-lifecycle", fetchProductions);

export default router;
