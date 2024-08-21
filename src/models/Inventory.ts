import mongoose from "mongoose";
import "dotenv/config";

export enum InventoryType {
  Raw = "raw",
  Cutting = "cutting",
  Ready = "ready",
}
interface Inventory extends mongoose.Document {
  name: string;
  quantity: number;
  price: number;
  min_limit: number;
  image_url: string;
  inventory_type: InventoryType;
}

const InventorySchema = new mongoose.Schema<Inventory>({
  name: {
    type: String,
  },
  quantity: {
    type: Number,
  },
  price: {
    type: Number,
  },
  min_limit: {
    type: Number,
  },
  image_url: {
    type: String,
  },
  inventory_type: {
    type: String,
    required: true,
    enum: Object.values(InventoryType),
    default: InventoryType.Raw,
  },
});

export default mongoose.model<Inventory>("Inventory", InventorySchema);
