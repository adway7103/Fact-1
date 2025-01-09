import mongoose from "mongoose";
import "dotenv/config";

interface IStage extends mongoose.Document {
  name: string;
  description?: string;
}

const StageModel = new mongoose.Schema<IStage>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IStage>("StageModel", StageModel);
