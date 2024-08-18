import express from "express";

const router = express.Router();
import { registerC, loginC } from "../controllers/AuthController.js";
import { CheckPrimeOptions } from "crypto";
import { checkPermissions } from "../middleware/checkPermissions.js";
router.post("/add-user", checkPermissions("add-user"), registerC);
router.post("/login", loginC);

export default router;
