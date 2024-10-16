import express from "express";
import {
  startNewProduction,
  fetchProductions,
  updateProductionById,
} from "../controllers/ProductionController.js";

const router = express.Router();
router
  .get("/get-all-productions", fetchProductions)
  .post("/start-new", startNewProduction)
  .put("/update/:id", updateProductionById);

export default router;
