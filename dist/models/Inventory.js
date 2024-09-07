import mongoose from "mongoose";
import "dotenv/config";
export var InventoryType;
(function (InventoryType) {
    InventoryType["Raw"] = "raw";
    InventoryType["Cutting"] = "cutting";
    InventoryType["Ready"] = "ready";
})(InventoryType || (InventoryType = {}));
export var RawSubCategory;
(function (RawSubCategory) {
    RawSubCategory["Roll"] = "roll";
    RawSubCategory["Astar"] = "astar";
    RawSubCategory["Accessories"] = "accessories";
})(RawSubCategory || (RawSubCategory = {}));
const InventorySchema = new mongoose.Schema({
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
export default mongoose.model("Inventory", InventorySchema);
