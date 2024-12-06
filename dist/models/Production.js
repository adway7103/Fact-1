import mongoose from "mongoose";
import "dotenv/config";
// Create the ProductionDetails schema
const ProductionDetailsSchema = new mongoose.Schema({
    costPrice: {
        type: Number,
        required: true,
    },
    noOfPieces: {
        type: Number,
        required: true,
    },
    grade: {
        type: String,
        required: true,
    },
    meter: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    rollNo: {
        type: String,
        required: true,
    },
    sort: {
        type: String,
        required: true,
    },
});
// Create the IProduction schema
const ProductionSchema = new mongoose.Schema({
    rolls: {
        type: [ProductionDetailsSchema], // Use the ProductionDetails schema
        required: true,
    },
    name: {
        type: String,
        required: function () {
            return this.assignTo === null;
        }, // Only required if assignTo is null
    },
    contact: {
        type: String,
        required: function () {
            return this.assignTo === null;
        }, // Only required if assignTo is null
    },
    expectedDeliveryDate: {
        type: String,
        required: true,
    },
    assignTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    markAsDone: {
        type: Boolean,
        default: false, // Default is false (not done)
    },
    type: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false,
    },
}, {
    timestamps: true, // Add timestamps to the schema
});
// Create the model
export const ProductionModel = mongoose.model("Production", ProductionSchema);
