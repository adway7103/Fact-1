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
import Issuance from "../models/IssuanceRecord.js";
import Inventory from "../models/Inventory.js";
import Lifecycle from "../models/Lifecycle.js";
//function to issue inventory items
export const issueInventoryItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { lot, stage, inventory, inventoryItem, quantity, totalQuantity, allotTo, name, contact, } = req.body;
    const lifecycle = yield Lifecycle.findById(lot);
    if (!lifecycle) {
        return res.status(404).json({
            success: false,
            message: "Lifecycle not found.",
        });
    }
    const isStageExist = yield Lifecycle.findOne({
        _id: lot,
        stages: { $elemMatch: { _id: stage } },
    });
    if (!isStageExist) {
        return res.status(404).json({
            success: false,
            message: "Stage not found in this Lifecycle.",
        });
    }
    const errors = [];
    if (!lot)
        errors.push("Lot is required.");
    if (!stage)
        errors.push("Stage is required.");
    if (!inventory)
        errors.push("Inventory is required.");
    if (!inventoryItem)
        errors.push("Inventory Item is required.");
    if (!quantity)
        errors.push("Quantity is required.");
    if (quantity < 1)
        errors.push("Quantity is required.");
    if (!totalQuantity)
        errors.push("Total Quantity is required.");
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
    }
    else {
        if (!mongoose.Types.ObjectId.isValid(allotTo)) {
            return res.status(400).json({
                success: false,
                message: "The Assign To field is required.",
            });
        }
    }
    try {
        // Find the inventory item based on inventory and inventoryItem fields
        const inventoryItemToUpdate = yield Inventory.findOne({
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
            yield Inventory.deleteOne({ _id: inventoryItemToUpdate._id });
        }
        else if (inventoryItemToUpdate.quantity > quantity) {
            inventoryItemToUpdate.quantity -= quantity;
            yield inventoryItemToUpdate.save();
        }
        else {
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
        const savedIssuance = yield newIssuance.save();
        res.locals.createdDocument = savedIssuance;
        return res.status(201).json({
            success: true,
            message: "Inventory Items Issued Successfully.",
            Issuance: savedIssuance,
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
//function to fetch all issuance records
export const fetchIssuanceRecords = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const issuanceRecords = yield Issuance.find()
            .populate({
            path: "allotTo allotBy",
            select: "name phoneNo",
        })
            .populate({
            path: "lot",
            select: "lotNo",
        });
        const lotIds = [
            ...new Set(issuanceRecords.map((issuance) => { var _a; return (_a = issuance.lot) === null || _a === void 0 ? void 0 : _a._id; })),
        ];
        const lifecycleRecords = yield Lifecycle.find({ _id: { $in: lotIds } });
        const issuanceWithStageDetails = issuanceRecords.map((issuance) => {
            const lifecycle = lifecycleRecords.find((l) => { var _a; return l._id.toString() === ((_a = issuance.lot) === null || _a === void 0 ? void 0 : _a._id.toString()); });
            const stageDetails = lifecycle === null || lifecycle === void 0 ? void 0 : lifecycle.stages.find((stage) => (stage === null || stage === void 0 ? void 0 : stage._id.toString()) === issuance.stage.toString());
            return Object.assign(Object.assign({}, issuance.toObject()), { stageDetails: stageDetails || null });
        });
        res.json({
            success: true,
            message: "Issuance Records fetched successfully.",
            issuanceRecords: issuanceWithStageDetails,
            //   count: issuanceWithStageDetails.length,
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
//function to fetch issuance records with lot id
export const fetchIssuanceRecordsWithUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.body;
    try {
        const issuanceRecord = yield Issuance.find({ allotTo: user_id })
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
        const lifecycleRecords = yield Lifecycle.find({ _id: { $in: lotIds } });
        const issuanceWithStageDetails = issuanceRecord.map((issuance) => {
            const lifecycle = lifecycleRecords.find((l) => l._id.toString() === issuance.lot._id.toString());
            const stageDetails = lifecycle === null || lifecycle === void 0 ? void 0 : lifecycle.stages.find((stage) => (stage === null || stage === void 0 ? void 0 : stage._id.toString()) === issuance.stage.toString());
            return Object.assign(Object.assign({}, issuance.toObject()), { stageDetails: stageDetails || null });
        });
        res.json({
            success: true,
            message: "Issuance Records fetched successfully.",
            issuanceRecords: issuanceWithStageDetails,
            count: issuanceWithStageDetails.length,
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
//function to fetch issuance records with lot id
export const fetchIssuanceRecordsWitId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const issuanceRecord = yield Issuance.find({ lot: id })
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
        const lifecycleRecords = yield Lifecycle.find({ _id: { $in: lotIds } });
        const issuanceWithStageDetails = issuanceRecord.map((issuance) => {
            const lifecycle = lifecycleRecords.find((l) => l._id.toString() === issuance.lot._id.toString());
            const stageDetails = lifecycle === null || lifecycle === void 0 ? void 0 : lifecycle.stages.find((stage) => (stage === null || stage === void 0 ? void 0 : stage._id.toString()) === issuance.stage.toString());
            return Object.assign(Object.assign({}, issuance.toObject()), { stageDetails: stageDetails || null });
        });
        res.json({
            success: true,
            message: "Issuance Records fetched successfully.",
            issuanceRecord: issuanceWithStageDetails,
            count: issuanceWithStageDetails.length,
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
