import express from "express";
import { issueInventoryItems, fetchIssuanceRecords, fetchIssuanceRecordsWitId, fetchIssuanceRecordsWithUserId, } from "../controllers/IssuanceRecordController.js";
const router = express.Router();
router
    .post("/issue-inventory-items", issueInventoryItems)
    .get("/issuance-records", fetchIssuanceRecords)
    .get("/issuance-record/:id", fetchIssuanceRecordsWitId)
    .get("/my-issuance-record", fetchIssuanceRecordsWithUserId);
export default router;
