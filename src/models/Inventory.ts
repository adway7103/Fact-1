import mongoose from "mongoose";
import "dotenv/config";

export enum InventoryType {
  Raw = "raw",
  Cutting = "cutting",
  Ready = "ready",
}

export enum RawSubCategory {
  Roll = "roll",
  Astar = "astar",
  Accessories = "accessories",
}

interface ExtraField {
  key: string;
  value: any;
}

interface Inventory extends mongoose.Document {
  name: string;
  quantity: number;
  price: number;
  min_limit: number;
  image_url: string;
  inventory_type: InventoryType;
  sub_category?: RawSubCategory;
  extra_fields?: ExtraField[];
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
  sub_category: {
    type: String,
    enum: Object.values(RawSubCategory),
    required: function () {
      return this.inventory_type === InventoryType.Raw;
    },
  },
  extra_fields: {
    type: [
      {
        key: String,
        value: mongoose.Schema.Types.Mixed,
      },
    ],
    required: false,
  },
});

export default mongoose.model<Inventory>("Inventory", InventorySchema);
