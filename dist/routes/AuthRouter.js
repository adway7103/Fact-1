import express from "express";
const router = express.Router();
import { registerC, loginC } from "../controllers/AuthController.js";
import { checkPermissions } from "../middleware/checkPermissions.js";
import authenticate from "../middleware/authentication.js";
router.post("/add-user", authenticate, checkPermissions("add-user"), registerC);
// router.post("/add-user", registerC);
router.post("/login", loginC);
export default router;
