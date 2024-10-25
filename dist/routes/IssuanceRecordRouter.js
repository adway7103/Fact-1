import express from "express";
import { issueInventoryItems, fetchIssuanceRecords, } from "../controllers/IssuanceRecordController.js";
const router = express.Router();
router
    .post("/issue-inventory-items", issueInventoryItems)
    .get("/issuance-records", fetchIssuanceRecords);
export default router;
