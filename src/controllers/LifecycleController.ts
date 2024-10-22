import mongoose from "mongoose";
import Lifecycle from "../models/Lifecycle.js";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { StageDetails } from "../models/schemas/stageDetails.js";

// Function to create a new lifecycle
export const startNewLifecycle = async (req: Request, res: Response) => {
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
          message:
            "The 'name' field is required in stages when assignTo is 'others'.",
        });
      }

      if (!contact) {
        return res.status(400).json({
          success: false,
          message:
            "The 'contact' field is required in stages when assignTo is 'others'.",
        });
      }

      // Set assignTo to null if it's "others"
      stage.assignTo = null;
    } else {
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

    const savedLifecycle = await newLifecycle.save();

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
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

//function to fetch all lifecycle
export const fetchLifecycles = async (req: Request, res: Response) => {
  try {
    const lifecycle = await Lifecycle.find().populate({
      path: "stages.assignTo",
      select: "name phoneNo",
    });

    return res.status(200).json({
      success: true,
      message: "Lifecycle fetched successfully.",
      lifecycle,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

//function to fetch lifecycle by id
export const fetchLifecycleById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const lifecycle = await Lifecycle.findById(id).populate({
      path: "stages.assignTo",
      select: "name phoneNo",
    });

    return res.status(200).json({
      success: true,
      message: "Lifecycle fetched successfully.",
      lifecycle,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

//update stage
export const updateLifecycle = async (req: Request, res: Response) => {
  const { id, stageId } = req.params;
  const { isCompleted, markAsDone } = req.body;

  try {
    const lifecycle = await Lifecycle.findById(id);

    if (!lifecycle) {
      return res.status(404).json({
        success: false,
        message: "Lifecycle not found.",
      });
    }

    const stage = lifecycle.stages.find((stage: any) => {
      return stage._id.toString() === stageId;
    });

    if (!stage) {
      return res.status(404).json({
        success: false,
        message: "Stage not found in the lifecycle.",
      });
    }
    stage.isCompleted = isCompleted;

    if (isCompleted) {
      stage.endTime = new Date();
    } else {
      stage.endTime = undefined;
    }

    stage.isCompleted = isCompleted;

    // Update end time if completed
    if (isCompleted) {
      stage.endTime = new Date();
    } else {
      stage.endTime = undefined;
    }

    const isLastStage = lifecycle.stages[lifecycle.stages.length - 1];
    if (isLastStage._id.toString() === stageId && markAsDone) {
      lifecycle.markAsDone = true;
      lifecycle.stages[lifecycle.stages.length - 1].isCompleted = true;
      lifecycle.completionDate = new Date();
    }

    await lifecycle.save();

    return res.status(200).json({
      success: true,
      message: "Stage updated successfully.",
      lifecycle,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the stage.",
      error: error.message,
    });
  }
};

// Function to start a new stage
export const startLifecycleNewStage = async (req: Request, res: Response) => {
  const { id } = req.params;
  let {
    stage,
    expectedDeliveryDate,
    assignTo,
    name,
    contact,
    additionalInformation,
  } = req.body;

  try {
    const lifecycle = await Lifecycle.findById(id);
    if (!lifecycle) {
      return res.status(404).json({
        success: false,
        message: "Lifecycle not found.",
      });
    }

    // Check if the stage already exists
    const existingStage = lifecycle.stages.find(
      (s) => s.stage.toLowerCase() === stage.toLowerCase()
    );

    if (existingStage) {
      return res.status(400).json({
        success: false,
        message: `The stage '${stage}' already created in this lifecycle.`,
      });
    }

    // Validate assignTo
    if (assignTo === "others") {
      if (!name) {
        return res.status(400).json({
          success: false,
          message: "The 'name' field is required when assignTo is 'others'.",
        });
      }

      if (!contact) {
        return res.status(400).json({
          success: false,
          message: "The 'contact' field is required when assignTo is 'others'.",
        });
      }

      assignTo = null;
      console.log(assignTo);
    } else if (!mongoose.Types.ObjectId.isValid(assignTo)) {
      return res.status(400).json({
        success: false,
        message: "The Assign To field must be a valid ObjectId.",
      });
    }

    const newStage: StageDetails = {
      stage: stage.toLowerCase(),
      startTime: new Date(),
      expectedDeliveryDate,
      assignTo,
      name,
      contact,
      isCompleted: false,
      additionalInformation: additionalInformation ? additionalInformation : "",
    };

    const updatedLifecycle = await Lifecycle.findByIdAndUpdate(
      id,
      { $push: { stages: newStage } },
      { new: true }
    );
    return res.status(201).json({
      success: true,
      message: "Lifecycle stage started successfully.",
      lifecycle: updatedLifecycle,
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
