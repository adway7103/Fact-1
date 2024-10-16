import { Request, Response } from "express";
import { ProductionModel } from "../models/Production.js";
import Inventory from "../models/Inventory.js"; // Import your Inventory model
import mongoose from "mongoose";

// Function to create a new production and delete the roll from inventory
export const startNewProduction = async (req: Request, res: Response) => {
  let { rolls, name, contact, expectedDeliveryDate, assignTo, markAsDone } =
    req.body;

  if (!rolls || !Array.isArray(rolls) || rolls.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please Add Roll to continue.",
    });
  }

  if (assignTo === "others") {
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

    assignTo = null;
  } else {
    if (!mongoose.Types.ObjectId.isValid(assignTo)) {
      return res.status(400).json({
        success: false,
        message: "The Assign To field is required.",
      });
    }
  }

  if (!expectedDeliveryDate) {
    return res.status(400).json({
      success: false,
      message: "The Expected Delivery Date is required.",
    });
  }

  try {
    // Create the new production
    const newProduction = new ProductionModel({
      rolls,
      name: assignTo === null ? name : undefined,
      contact: assignTo === null ? contact : undefined,
      expectedDeliveryDate,
      assignTo,
      markAsDone: markAsDone || false,
    });

    const savedProduction = await newProduction.save();

    //deleting roll based on rollNum after starting production.
    for (const roll of rolls) {
      const inventoryRoll = await Inventory.findOneAndDelete({
        "extra_fields.0.roll_number": roll.rollNo,
      });

      if (!inventoryRoll) {
        return res.status(404).json({
          success: false,
          message: `Roll with rollNo ${roll.rollNo} not found in Inventory.`,
        });
      }
    }

    return res.status(201).json({
      success: true,
      message:
        "Production created successfully and roll(s) deleted from inventory.",
      production: savedProduction,
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

//function to fetch production
export const fetchProductions = async (req: Request, res: Response) => {
  try {
    const productions = await ProductionModel.find().populate({
      path: "assignTo", // Field in Production schema
      select: "name phoneNo", // Only select the 'name' and 'phoneNo' field from the User schema
    });

    return res.status(200).json({
      success: true,
      message: "Production fetched successfully.",
      productions,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

//function to fetch production for assigned user
export const getUserAssignedProduction = async (
  req: Request,
  res: Response
) => {
  try {
    const { user_id } = req.body;
    const productions = await ProductionModel.find({
      assignTo: user_id,
      markAsDone: false,
    });
    return res.status(200).json({
      success: true,
      message: "My Production fetched successfully.",
      productions,
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

//function to update production
export const updateProductionById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { markAsDone } = req.body;

  try {
    const production = await ProductionModel.findById(id);

    if (!production) {
      return res.status(404).json({
        success: false,
        message: "Production not found.",
      });
    }
    production.markAsDone = markAsDone;
    const updatedProduction = await production.save();

    return res.status(200).json({
      success: true,
      message: "Production updated successfully.",
      production: updatedProduction,
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
