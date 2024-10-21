import mongoose from "mongoose";
import "dotenv/config";

// Define the LifeCycleDetails interface
export interface LifeCycleDetails {
  costPrice: number;
  grade: string;
  meter: number;
  noOfPieces: number;
  price: number;
  rollNo: string;
  sort: string;
}

// Create the LifeCycleDetails schema
export const LifecycleDetailsSchema = new mongoose.Schema<LifeCycleDetails>({
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