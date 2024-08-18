import AddPermissions from "../controllers/Rules.js";
import express from "express";
import { checkPermissions } from "../middleware/checkPermissions.js";
const router = express.Router();
router.post("/add-permission", checkPermissions("add-permission"), AddPermissions);
