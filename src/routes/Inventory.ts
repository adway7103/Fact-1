import express from "express";
import { checkPermissions } from "../middleware/checkPermissions.js";
import {
  addItem,
  updateItemQuantity,
  deleteItem,
  getItems,
  getRollItemById,
} from "../controllers/InventoryController.js";

const router = express.Router();
router
  .get("/get-items", getItems)
  .get("/get-item/:id", getRollItemById)
  .post("/add-item", addItem)
  .put("/update-item", updateItemQuantity)
  .delete("/delete-item", deleteItem);
// router.get("/get-items", getItems).post("/add-item", checkPermissions("add-inventory-item"),addItem).put("/update-item",checkPermissions("update-inventory-item"), updateItemQuantity).delete("/delete-item",checkPermissions("delete-inventory-item"), deleteItem);

export default router;
