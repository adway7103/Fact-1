import mongoose from "mongoose";
import "dotenv/config";
import {
  StageDetailsSchema,
  StageDetails,
  StageEnum,
} from "./schemas/stageDetails.js";
import {
  LifecycleDetailsSchema,
  LifeCycleDetails,
} from "./schemas/lifecycleDetailsSchema.js";

// Define the ILifecycle interface
interface ILifecycle extends mongoose.Document {
  rolls: LifeCycleDetails[];
  markAsDone: boolean;
  lotNo: string;
//   currentStage: StageEnum;
  stages: StageDetails[];
  completionDate?: Date; // Add this line
}

// Create the ILifecycle schema
const LifecycleSchema = new mongoose.Schema<ILifecycle>(
  {
    rolls: {
      type: [LifecycleDetailsSchema],
      required: true,
    },
    lotNo: {
      type: String,
      required: true,
    },
    markAsDone: {
      type: Boolean,
      default: false,
    },
    // currentStage: {
    //   type: String,
    //   enum: Object.values(StageEnum),
    //   required: true,
    //   default: StageEnum.Karigar,
    // },
    stages: {
      type: [StageDetailsSchema],
      required: true,
    }, completionDate: {
        type: Date,
        required: false,
      },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ILifecycle>("Lifecycle", LifecycleSchema);
