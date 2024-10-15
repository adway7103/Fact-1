import mongoose from "mongoose";
import "dotenv/config";

// Define the ProductionDetails interface
interface ProductionDetails {
  costPrice: number;
  grade: string;
  meter: number;
  noOfPieces: number;
  price: number;
  rollNo: string;
  sort: string;
}

// Define the IProduction interface
interface IProduction extends mongoose.Document {
  rolls: ProductionDetails[];
  name?: string;
  contact?: string;
  expectedDeliveryDate: string;
  assignTo?: mongoose.Types.ObjectId | null; // Allow null or undefined
  markAsDone: boolean; // New field
}

// Create the ProductionDetails schema
const ProductionDetailsSchema = new mongoose.Schema<ProductionDetails>({
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
const ProductionSchema = new mongoose.Schema<IProduction>({
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
});

// Create the model
export const ProductionModel = mongoose.model<IProduction>(
  "Production",
  ProductionSchema
);
