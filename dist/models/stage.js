import mongoose from "mongoose";
import "dotenv/config";
const StageModel = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
}, {
    timestamps: true,
});
export default mongoose.model("StageModel", StageModel);
