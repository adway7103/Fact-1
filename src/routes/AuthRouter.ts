import express from "express";

const router = express.Router();
import { registerC, loginC, editUser } from "../controllers/AuthController.js";
import { CheckPrimeOptions } from "crypto";
import { checkPermissions } from "../middleware/checkPermissions.js";
import authenticate from "../middleware/authentication.js";
router.post("/add-user", authenticate,checkPermissions("add-user"), registerC);
router.put("/edit-user", authenticate,checkPermissions("edit-user"), editUser);
// router.post("/add-user", registerC);

router.post("/login", loginC);

export default router;
