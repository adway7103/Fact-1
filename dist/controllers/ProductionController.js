var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ProductionModel } from "../models/Production.js";
import Inventory from "../models/Inventory.js"; // Import your Inventory model
import mongoose from "mongoose";
// Function to create a new production and delete the roll from inventory
export const startNewProduction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { rolls, name, contact, expectedDeliveryDate, assignTo, markAsDone } = req.body;
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
    }
    else {
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
        const savedProduction = yield newProduction.save();
        //deleting roll based on rollNum after starting production.
        for (const roll of rolls) {
            const inventoryRoll = yield Inventory.findOneAndDelete({
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
            message: "Production created successfully and roll(s) deleted from inventory.",
            production: savedProduction,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error.",
            error: error.message,
        });
    }
});
//function to fetch production
export const fetchProductions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productions = yield ProductionModel.find().populate({
            path: "assignTo", // Field in Production schema
            select: "name phoneNo", // Only select the 'name' field from the User schema
        });
        return res.status(200).json({
            success: true,
            message: "Production fetched successfully.",
            productions,
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
