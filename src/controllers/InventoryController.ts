import Inventory from "../models/Inventory.js";
import Alerts from "../models/Alerts.js";
import { InventoryType, RawSubCategory } from "../models/Inventory.js";
import { Request, Response } from "express";

export const getItems = async (req: Request, res: Response) => {
  try {
    const items = await Inventory.find();
    return res.status(200).json({ items });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const getItemsBySubcategory = async (req: Request, res: Response) => {
  const sub_category = req.query.type;

  if (!sub_category) {
    return res.status(400).json({
      success: false,
      message: "Subcategory is required.",
    });
  }
  try {
    const items = await Inventory.find({
      inventory_type: "raw",
      sub_category: sub_category,
    });
    return res.status(200).json({ items });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const getRollItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const items = await Inventory.findById(id);
    return res.status(200).json({ items });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const updateRawSubcategory = async (req: Request, res: Response) => {
  try {
    const { item_id, sub_category } = req.body;
    if (!item_id || !sub_category) {
      return res.status(400).json({ error: "Please provide all fields" });
    }
    const mappedSubCategory = Object.values(RawSubCategory).find(
      (category) => category.toLowerCase() === sub_category.toLowerCase()
    );

    if (!mappedSubCategory) {
      return res
        .status(400)
        .json({ error: "Invalid subcategory for raw inventory type" });
    }
    const item = await Inventory.findByIdAndUpdate(
      item_id,
      { sub_category: mappedSubCategory },
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    return res.status(200).json({ message: "Item Subcategory updated" });
  } catch (error: any) {}
};

export const addItem = async (req: Request, res: Response) => {
  try {
    const {
      name,
      quantity,
      price,
      min_limit,
      image_url,
      inventory_type,
      sub_category,
      extra_fields,
    } = req.body;

    if (
      !name ||
      !quantity ||
      !price ||
      !min_limit ||
      !image_url ||
      !inventory_type
    ) {
      return res.status(400).json({ error: "Please enter all fields" });
    }

    const mappedInventoryType = Object.values(InventoryType).find(
      (type) => type.toLowerCase() === inventory_type.toLowerCase()
    );

    if (!mappedInventoryType) {
      return res.status(400).json({ error: "Invalid inventory type" });
    }

    if (mappedInventoryType === InventoryType.Raw) {
      if (!sub_category) {
        return res
          .status(400)
          .json({ error: "Subcategory is required for raw inventory type" });
      }

      const mappedSubCategory = Object.values(RawSubCategory).find(
        (category) => category.toLowerCase() === sub_category.toLowerCase()
      );

      if (!mappedSubCategory) {
        return res
          .status(400)
          .json({ error: "Invalid subcategory for raw inventory type" });
      }

      if (extra_fields && !Array.isArray(extra_fields)) {
        return res
          .status(400)
          .json({ error: "Extra fields should be an array" });
      }
    }

    //chek existing roll number
    const rollNumberField = extra_fields.find((field: any) =>
      field.hasOwnProperty("roll_number")
    );

    const rollNumber = rollNumberField ? rollNumberField["roll_number"] : null;

    if (rollNumber) {
      const existingInventory = await Inventory.findOne({
        "extra_fields.roll_number": rollNumber,
      });

      if (existingInventory) {
        return res.status(400).json({
          error: `Roll number ${rollNumber} already exists in the inventory.`,
        });
      }
    }

    //check existing color
    const colorField = extra_fields.find((field: any) =>
      field.hasOwnProperty("color")
    );

    const color = colorField ? colorField["color"] : null;

    if (color) {
      const existingInventory = await Inventory.findOne({
        "extra_fields.color": color,
      });

      if (existingInventory) {
        return res.status(400).json({
          error: `${color} color already exists in the inventory.`,
        });
      }
    }

    const item = await Inventory.create({
      name,
      quantity,
      price,

      min_limit,
      image_url,
      inventory_type: mappedInventoryType,
      sub_category:
        mappedInventoryType === InventoryType.Raw ? sub_category : undefined,
      extra_fields:
        mappedInventoryType === InventoryType.Raw ? extra_fields : undefined,
    });

    res.locals.createdDocument = item;

    return res.status(201).json({ item });
  } catch (error: any) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};

export const updateItemQuantity = async (req: Request, res: Response) => {
  try {
    const { item_id, quantity, min_limit, user_id } = req.body;
    if (!item_id) {
      return res.status(400).json({ error: "Please proide item Id" });
    }
    if (!quantity && !min_limit) {
      return res
        .status(400)
        .json({ error: "Please provide quantity or min_limit" });
    }
    const updateFields: any = { quantity: quantity };
    if (quantity !== undefined) {
      updateFields.quantity = quantity;
    }
    if (min_limit !== undefined) {
      updateFields.min_limit = min_limit;
    }
    const item = await Inventory.findByIdAndUpdate(item_id, updateFields, {
      new: true,
    });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    if (item.quantity < item.min_limit) {
      await Alerts.create({
        message: "Items is less than minimum limit",
        item: item._id,
        severienity: "mid",
      });
    }

    res.locals.createdDocument = item;

    return res.status(200).json({ message: "Item Quantity updated" });
  } catch (error: any) {
    return res.status(400).json({ message: "Error occured" });
  }
};

export const deleteItem = async (req: Request, res: Response) => {
  try {
    const { item_id } = req.body;
    if (!item_id) {
      return res.status(400).json({ error: "Please provide all fields" });
    }
    const item = await Inventory.findByIdAndDelete(item_id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    
    res.locals.createdDocument = item;

    return res.status(200).json({ message: "Item deleted" });
  } catch (error: any) {
    return res.status(400).json({ message: "Error occured" });
  }
};
