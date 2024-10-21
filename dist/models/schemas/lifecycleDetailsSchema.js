import mongoose from "mongoose";
import "dotenv/config";
// Create the LifeCycleDetails schema
export const LifecycleDetailsSchema = new mongoose.Schema({
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
