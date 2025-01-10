import mongoose from "mongoose";
import "dotenv/config";
import { UserType } from "./User.js";

interface RoleType extends mongoose.Document {
  role: UserType;
  permissions: string[];
}

const RoleSchema = new mongoose.Schema<RoleType>({
  role: {
    type: String,
    enum: Object.values(UserType),
    default: UserType.Worker,
  },
  permissions: [
    {
      type: String,
    },
  ],
});
export default mongoose.model<RoleType>("Role", RoleSchema);
