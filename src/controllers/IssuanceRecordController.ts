import mongoose from "mongoose";
import Issuance from "../models/IssuanceRecord.js";
import { Request, Response } from "express";
import Inventory from "../models/Inventory.js";
import Lifecycle from "../models/Lifecycle.js";

//function to issue inventory items
export const issueInventoryItems = async (req: Request, res: Response) => {
  let {
    lot,
    stage,
    inventory,
    inventoryItem,
    quantity,
    totalQuantity,
    allotTo,
    name,
    contact,
  } = req.body;

  const lifecycle = await Lifecycle.findById(lot);

  if (!lifecycle) {
    return res.status(404).json({
      success: false,
      message: "Lifecycle not found.",
    });
  }

  const isStageExist = await Lifecycle.findOne({
    _id: lot,
    stages: { $elemMatch: { _id: stage } },
  });

  if (!isStageExist) {
    return res.status(404).json({
      success: false,
      message: "Stage not found in this Lifecycle.",
    });
  }

  const errors: string[] = [];

  if (!lot) errors.push("Lot is required.");
  if (!stage) errors.push("Stage is required.");
  if (!inventory) errors.push("Inventory is required.");
  if (!inventoryItem) errors.push("Inventory Item is required.");
  if (!quantity) errors.push("Quantity is required.");
  if (quantity < 1) errors.push("Quantity is required.");
  if (!totalQuantity) errors.push("Total Quantity is required.");

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  if (allotTo === "others") {
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "The 'name' field is required.",
      });
    }

    if (!contact) {
      return res.status(400).json({
        success: false,
        message: "The 'contact' field is required.",
      });
    }

    allotTo = null;
  } else {
    if (!mongoose.Types.ObjectId.isValid(allotTo)) {
      return res.status(400).json({
        success: false,
        message: "The Assign To field is required.",
      });
    }
  }

  try {
    // Find the inventory item based on inventory and inventoryItem fields
    const inventoryItemToUpdate = await Inventory.findOne({
      sub_category: inventory,
      $or: [{ name: inventoryItem }, { "extra_fields.0.color": inventoryItem }],
    });

    if (!inventoryItemToUpdate) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
      });
    }

    if (inventoryItemToUpdate.quantity === quantity) {
      await Inventory.deleteOne({ _id: inventoryItemToUpdate._id });
    } else if (inventoryItemToUpdate.quantity > quantity) {
      inventoryItemToUpdate.quantity -= quantity;

      await inventoryItemToUpdate.save();
    } else {
      return res.status(400).json({
        success: false,
        message: "Issued quantity exceeds available stock.",
      });
    }

    // Create the new production
    const newIssuance = new Issuance({
      lot,
      stage,
      inventory,
      inventoryItem,
      quantity,
      totalQuantity,
      allotTo,
      allotBy: req.body.user_id,
      name,
      contact,
    });

    const savedIssuance = await newIssuance.save();

    return res.status(201).json({
      success: true,
      message: "Inventory Items Issued Successfully.",
      Issuance: savedIssuance,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

//function to fetch all issuance records
export const fetchIssuanceRecords = async (req: Request, res: Response) => {
  try {
    const issuanceRecords = await Issuance.find()
      .populate({
        path: "allotTo allotBy",
        select: "name phoneNo",
      })
      .populate({
        path: "lot",
        select: "lotNo",
      });

    const lotIds = [
      ...new Set(issuanceRecords.map((issuance) => issuance.lot?._id)),
    ];

    const lifecycleRecords = await Lifecycle.find({ _id: { $in: lotIds } });

    const issuanceWithStageDetails = issuanceRecords.map((issuance) => {
      const lifecycle = lifecycleRecords.find(
        (l) => l._id.toString() === issuance.lot?._id.toString()
      );

      const stageDetails = lifecycle?.stages.find(
        (stage) => stage._id.toString() === issuance.stage.toString()
      );

      return {
        ...issuance.toObject(),
        stageDetails: stageDetails || null,
      };
    });

    res.json({
      success: true,
      message: "Issuance Records fetched successfully.",
      issuanceRecords: issuanceWithStageDetails,
      //   count: issuanceWithStageDetails.length,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

//function to fetch issuance records with lot id
export const fetchIssuanceRecordsWithUserId = async (
  req: Request,
  res: Response
) => {
  const { user_id } = req.body;
  try {
    const issuanceRecord = await Issuance.find({ allotTo: user_id })
      .populate({
        path: "lot",
        select: "lotNo",
      })
      .populate({
        path: "allotTo allotBy",
        select: "name phoneNo",
      });
    const lotIds = [
      ...new Set(issuanceRecord.map((issuance) => issuance.lot._id)),
    ];

    const lifecycleRecords = await Lifecycle.find({ _id: { $in: lotIds } });

    const issuanceWithStageDetails = issuanceRecord.map((issuance) => {
      const lifecycle = lifecycleRecords.find(
        (l) => l._id.toString() === issuance.lot._id.toString()
      );

      const stageDetails = lifecycle?.stages.find(
        (stage) => stage._id.toString() === issuance.stage.toString()
      );

      return {
        ...issuance.toObject(),
        stageDetails: stageDetails || null,
      };
    });

    res.json({
      success: true,
      message: "Issuance Records fetched successfully.",
      issuanceRecords: issuanceWithStageDetails,
      count: issuanceWithStageDetails.length,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

//function to fetch issuance records with lot id
export const fetchIssuanceRecordsWitId = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  try {
    const issuanceRecord = await Issuance.find({ lot: id })
      .populate({
        path: "lot",
        select: "lotNo",
      })
      .populate({
        path: "allotTo allotBy",
        select: "name phoneNo",
      });
    const lotIds = [
      ...new Set(issuanceRecord.map((issuance) => issuance.lot._id)),
    ];

    const lifecycleRecords = await Lifecycle.find({ _id: { $in: lotIds } });

    const issuanceWithStageDetails = issuanceRecord.map((issuance) => {
      const lifecycle = lifecycleRecords.find(
        (l) => l._id.toString() === issuance.lot._id.toString()
      );

      const stageDetails = lifecycle?.stages.find(
        (stage) => stage._id.toString() === issuance.stage.toString()
      );

      return {
        ...issuance.toObject(),
        stageDetails: stageDetails || null,
      };
    });

    res.json({
      success: true,
      message: "Issuance Records fetched successfully.",
      issuanceRecord: issuanceWithStageDetails,
      count: issuanceWithStageDetails.length,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
