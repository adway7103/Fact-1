import express from "express";
import {
  startNewProduction,
  fetchProductions,
  updateProductionById,
  getUserAssignedProduction,
  generatePdf,
  fetchProductionById,
} from "../controllers/ProductionController.js";

const router = express.Router();
router
  .get("/get-all-productions", fetchProductions)
  .get("/get-my-productions", getUserAssignedProduction)
  .get("/getProductionById/:id", fetchProductionById)
  .get("/generate-pdf/:id", generatePdf)
  .post("/start-new", startNewProduction)
  .put("/update/:id", updateProductionById);

export default router;
