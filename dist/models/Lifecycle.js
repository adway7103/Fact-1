import mongoose from "mongoose";
import "dotenv/config";
import { StageDetailsSchema, } from "./schemas/stageDetails.js";
import { LifecycleDetailsSchema, } from "./schemas/lifecycleDetailsSchema.js";
// Create the ILifecycle schema
const LifecycleSchema = new mongoose.Schema({
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
}, {
    timestamps: true,
});
export default mongoose.model("Lifecycle", LifecycleSchema);
