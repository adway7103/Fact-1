import mongoose from "mongoose";
import "dotenv/config";
// Create the Issuance schema
const IssuanceSchema = new mongoose.Schema({
    lot: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Lifecycle",
    },
    stage: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "stageDetails",
    },
    inventory: {
        type: String,
        required: true,
        enum: ["accessories", "astar"],
    },
    inventoryItem: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        validate: {
            validator: function (quantity) {
                return quantity <= this.totalQuantity;
            },
            message: "Issued quantity exceeds available stock",
        },
    },
    totalQuantity: {
        type: Number,
        required: true,
    },
    allotTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    allotBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    name: {
        type: String,
        required: function () {
            return this.allotTo === null;
        }, // Only required if assignTo is null
    },
    contact: {
        type: String,
        required: function () {
            return this.allotTo === null;
        }, // Only required if assignTo is null
    },
    issuedDate: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
export default mongoose.model("Issuance", IssuanceSchema);
