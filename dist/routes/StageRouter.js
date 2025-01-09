import express from "express";
import { addStage, getAllStages, updateStage, deleteStage, } from "../controllers/manageStages.js";
import authenticate from "../middleware/authentication.js";
const router = express.Router();
/**
 * @route POST /stages
 * @description Create a new stage
 * @access Protected
 */
router.post("/stages", authenticate, addStage);
/**
 * @route GET /stages
 * @description Fetch all stages
 * @access Protected
 */
router.get("/stages", authenticate, getAllStages);
/**
 * @route PUT /stages/:id
 * @description Update a stage by ID
 * @access Protected
 */
router.put("/stages/:id", authenticate, updateStage);
/**
 * @route DELETE /stages/:id
 * @description Delete a stage by ID
 * @access Protected
 */
router.delete("/stages/:id", authenticate, deleteStage);
export default router;
