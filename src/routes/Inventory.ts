import express from "express";
import { checkPermissions } from "../middleware/checkPermissions.js";
import { addItem, updateItemQuantity, deleteItem } from "../controllers/InventoryController.js";

const router = express.Router();
router.post("/add-item", checkPermissions("add-inventory-item"),addItem).put("/update-item",checkPermissions("update-inventory-item"), updateItemQuantity).delete("/delete-item",checkPermissions("delete-inventory-item"), deleteItem);


export default router;