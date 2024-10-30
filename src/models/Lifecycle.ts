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
