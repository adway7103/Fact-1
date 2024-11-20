import express from "express";

const router = express.Router();
import {
  registerC,
  loginC,
  editUser,
  fetchUsers,
  getUser,
  deleteUser,
} from "../controllers/AuthController.js";
import { CheckPrimeOptions } from "crypto";
import { checkPermissions } from "../middleware/checkPermissions.js";
import authenticate from "../middleware/authentication.js";
router.post("/add-user", authenticate, registerC);
// router.post("/add-user", authenticate,checkPermissions("add-user"), registerC);
router.get("/fetch-users", authenticate, fetchUsers);
router.get("/get-user", authenticate, getUser);
router.put("/edit-user/:id", authenticate, editUser);
// router.put("/edit-user/:id", authenticate,checkPermissions("edit-user"), editUser);
router.delete(
  "/delete-user",
  authenticate,
  // checkPermissions("delete-user"),
  deleteUser
);
// router.post("/add-user", registerC);

router.post("/login", loginC);

export default router;
