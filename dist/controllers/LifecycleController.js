var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from "mongoose";
import Lifecycle from "../models/Lifecycle.js";
import { v4 as uuidv4 } from "uuid";
// Function to create a new lifecycle
export const startNewLifecycle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uuid = uuidv4();
    const lotNumber = `LN-${uuid.slice(0, 4)}`;
    let { rolls, markAsDone, stages } = req.body;
    if (!rolls || !Array.isArray(rolls) || rolls.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Please Add Roll to continue.",
        });
    }
    for (const stage of stages) {
        const { expectedDeliveryDate, assignTo, name, contact } = stage;
        // Validate expectedDeliveryDate
        if (!expectedDeliveryDate) {
            return res.status(400).json({
                success: false,
                message: "The Expected Delivery Date is required in stages.",
            });
        }
        // Validate assignTo
        if (assignTo === "others") {
            if (!name) {
                return res.status(400).json({
                    success: false,
                    message: "The 'name' field is required in stages when assignTo is 'others'.",
                });
            }
            if (!contact) {
                return res.status(400).json({
                    success: false,
                    message: "The 'contact' field is required in stages when assignTo is 'others'.",
                });
            }
            // Set assignTo to null if it's "others"
            stage.assignTo = null;
        }
        else {
            if (!mongoose.Types.ObjectId.isValid(assignTo)) {
                return res.status(400).json({
                    success: false,
                    message: "The Assign To field must be a valid ObjectId in stages.",
                });
            }
        }
        stage.startTime = new Date();
    }
    try {
        // Create the new lifecycle
        const newLifecycle = new Lifecycle({
            rolls,
            markAsDone: markAsDone || false,
            lotNo: lotNumber,
            stages,
        });
        const savedLifecycle = yield newLifecycle.save();
        //deleting roll based on rollNum after starting production.
        // for (const roll of rolls) {
        //   const inventoryRoll = await Inventory.findOneAndDelete({
        //     "extra_fields.0.roll_number": roll.rollNo,
        //   });
        //   if (!inventoryRoll) {
        //     return res.status(404).json({
        //       success: false,ssssss
        //       message: `Roll with rollNo ${roll.rollNo} not found in Inventory.`,
        //     });
        //   }
        // }
        return res.status(201).json({
            success: true,
            message: "Lifecycle started successfully.",
            lifecycle: newLifecycle,
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
//function to fetch all lifecycle
export const fetchProductions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lifecycle = yield Lifecycle.find().populate({
            path: "stages.assignTo",
            select: "name phoneNo",
        });
        return res.status(200).json({
            success: true,
            message: "Lifecycle fetched successfully.",
            lifecycle,
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
