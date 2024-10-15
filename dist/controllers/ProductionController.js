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
import mongoose from "mongoose";
//function to create a new production
export const startNewProduction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { rolls, name, contact, expectedDeliveryDate, assignTo, markAsDone } = req.body;
    if (!rolls || !Array.isArray(rolls) || rolls.length === 0) {
        return res.status(400).json({
            success: false,
            message: "The 'rolls' field is required and must be a non-empty array.",
        });
    }
    if (!expectedDeliveryDate) {
        return res.status(400).json({
            success: false,
            message: "The 'expectedDeliveryDate' field is required.",
        });
    }
    if (assignTo === "others") {
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "The 'name' field is required when assigning to others.",
            });
        }
        if (!contact) {
            return res.status(400).json({
                success: false,
                message: "The 'contact' field is required when assigning to others.",
            });
        }
        assignTo = null;
    }
    else {
        if (!mongoose.Types.ObjectId.isValid(assignTo)) {
            return res.status(400).json({
                success: false,
                message: "The 'assignTo' field must be a valid ObjectId.",
            });
        }
    }
    try {
        const newProduction = new ProductionModel({
            rolls,
            name: assignTo === null ? name : undefined,
            contact: assignTo === null ? contact : undefined,
            expectedDeliveryDate,
            assignTo,
            markAsDone: markAsDone || false,
        });
        const savedProduction = yield newProduction.save();
        return res.status(201).json({
            success: true,
            message: "Production created successfully.",
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
            select: "name", // Only select the 'name' field from the User schema
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
