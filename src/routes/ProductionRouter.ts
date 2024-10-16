import express from "express";
import {
  startNewProduction,
  fetchProductions,
  updateProductionById,
  getUserAssignedProduction,
} from "../controllers/ProductionController.js";

const router = express.Router();
router
  .get("/get-all-productions", fetchProductions)
  .get("/get-my-productions", getUserAssignedProduction)
  .post("/start-new", startNewProduction)
  .put("/update/:id", updateProductionById);

export default router;
