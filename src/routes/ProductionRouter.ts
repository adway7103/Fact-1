import express from "express";
import {
  startNewProduction,
  fetchProductions,
} from "../controllers/ProductionController.js";

const router = express.Router();
router
  .get("/get-all-productions", fetchProductions)
  .post("/start-new", startNewProduction);

export default router;
