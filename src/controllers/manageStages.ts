import { Request, Response } from "express";
import StageModel from "../models/stage.js"; // Adjust the import path according to your project structure

// Function to create a new stage
export const addStage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    const stage = new StageModel({ name, description });
    await stage.save();

    res.status(201).json({ message: "Stage created successfully", stage });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Function to get all stages
export const getAllStages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stages = await StageModel.find();
    res.status(200).json(stages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Function to update a stage
export const updateStage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updatedStage = await StageModel.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );

    if (!updatedStage) {
      res.status(404).json({ message: "Stage not found" });
      return;
    }

    res
      .status(200)
      .json({ message: "Stage updated successfully", updatedStage });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Function to delete a stage
export const deleteStage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedStage = await StageModel.findByIdAndDelete(id);

    if (!deletedStage) {
      res.status(404).json({ message: "Stage not found" });
      return;
    }

    res.status(200).json({ message: "Stage deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
