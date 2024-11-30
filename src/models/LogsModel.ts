import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  action: { type: String },
  details: { type: Object },
  timestamp: { type: Date, default: Date.now },
});

const Log = mongoose.model("Log", logSchema);

export default Log;
