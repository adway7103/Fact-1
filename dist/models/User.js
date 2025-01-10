import mongoose from "mongoose";
import "dotenv/config";
export var UserType;
(function (UserType) {
    UserType["SuperAdmin"] = "SuperAdmin";
    UserType["SuperManager"] = "SuperManager";
    UserType["CuttingManager"] = "CuttingManager";
    UserType["LifecycleManager"] = "LifecycleManager";
    UserType["InventoryManager"] = "InventoryManager";
    UserType["Worker"] = "worker";
})(UserType || (UserType = {}));
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        minlength: [3, "Name must be at least 3 characters long"],
        maxlength: [50, "Name must be at most 50 characters long"],
    },
    username: {
        type: String,
        unique: true,
        required: [true, "Please enter your username"],
        minlength: [3, "Username must be at least 3 characters long"],
        maxlength: [50, "Username must be at most 50 characters long"],
    },
    phoneNo: {
        type: String,
        required: [true, "Please enter your phone number"],
        minlength: [10, "Phone number must be at least 10 characters long"],
        maxlength: [13, "Phone number must be at most 13 characters long"],
    },
    userType: {
        type: String,
        required: [true, "Please enter your type"],
        default: UserType.Worker,
        enum: Object.values(UserType),
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minlength: [8, "Password must be at least 8 characters long"],
        maxlength: [1024, "Password must be at most 1024 characters long"],
    },
}, {
    timestamps: true, // Add timestamps to the schema
});
// UserSchema.pre("save", async function (next) {
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });
export default mongoose.model("User", UserSchema);
