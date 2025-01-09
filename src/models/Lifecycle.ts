import mongoose from "mongoose";
import "dotenv/config";
import { StageDetailsSchema, StageDetails } from "./schemas/stageDetails.js";
import {
  LifecycleDetailsSchema,
  LifeCycleDetails,
} from "./schemas/lifecycleDetailsSchema.js";
interface TypeEnum {
  Kids: "kids";
  Adult: "adult";
}
interface ILifecycle extends mongoose.Document {
  rolls: LifeCycleDetails[];
  markAsDone: boolean;
  lotNo: string;
  type: TypeEnum;
  //   currentStage: StageEnum;
  stages: StageDetails[];
  brand: string;
  accessories: string;
  mainThread: string;
  contrastThread: string;
  insideThread: string;
  washCard: string;
  embroidery: string;
  zip: string;
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
    type: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    accessories: {
      type: String,
      required: true,
    },
    mainThread: {
      type: String,
      required: true,
    },
    contrastThread: {
      type: String,
      required: true,
    },
    insideThread: {
      type: String,
      required: true,
    },
    washCard: {
      type: String,
      required: true,
    },
    embroidery: {
      type: String,
      required: true,
    },
    zip: {
      type: String,
      required: true,
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
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ILifecycle>("Lifecycle", LifecycleSchema);
