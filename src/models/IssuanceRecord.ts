import mongoose from "mongoose";
import "dotenv/config";

// Define the IIssuance interface
interface IIssuance extends mongoose.Document {
  lot: mongoose.Types.ObjectId;
  stage: mongoose.Types.ObjectId;
  inventory: "accessories" | "astar";
  inventoryItem: string;
  quantity: number;
  totalQuantity: number;
  allotTo?: mongoose.Types.ObjectId | null;
  allotBy: mongoose.Types.ObjectId;
  name?: string;
  contact?: string;
  issuedDate: Date;
}

// Create the Issuance schema
const IssuanceSchema = new mongoose.Schema<IIssuance>(
  {
    lot: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Lifecycle",
    },
    stage: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Lifecycle",
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
        validator: function (this: IIssuance, quantity: number): boolean {
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IIssuance>("Issuance", IssuanceSchema);
