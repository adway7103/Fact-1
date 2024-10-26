import express from "express";

import {
  issueInventoryItems,
  fetchIssuanceRecords,
  fetchIssuanceRecordsWitId,
} from "../controllers/IssuanceRecordController.js";
const router = express.Router();

router
  .post("/issue-inventory-items", issueInventoryItems)
  .get("/issuance-records", fetchIssuanceRecords)
  .get("/issuance-record/:id", fetchIssuanceRecordsWitId);

export default router;
