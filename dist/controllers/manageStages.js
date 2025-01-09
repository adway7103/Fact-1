var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import StageModel from "../models/stage.js"; // Adjust the import path according to your project structure
// Function to create a new stage
export const addStage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        const stage = new StageModel({ name, description });
        yield stage.save();
        res.status(201).json({ message: "Stage created successfully", stage });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Function to get all stages
export const getAllStages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stages = yield StageModel.find();
        res.status(200).json(stages);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Function to update a stage
export const updateStage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const updatedStage = yield StageModel.findByIdAndUpdate(id, { name, description }, { new: true });
        if (!updatedStage) {
            res.status(404).json({ message: "Stage not found" });
            return;
        }
        res
            .status(200)
            .json({ message: "Stage updated successfully", updatedStage });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Function to delete a stage
export const deleteStage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedStage = yield StageModel.findByIdAndDelete(id);
        if (!deletedStage) {
            res.status(404).json({ message: "Stage not found" });
            return;
        }
        res.status(200).json({ message: "Stage deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
