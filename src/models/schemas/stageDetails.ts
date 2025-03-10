import mongoose from "mongoose";
import "dotenv/config";

//define stage enum
// export enum StageEnum {
//   Karigar = "karigar",
//   Checking = "checking",
//   FeedOff = "feedoff",
//   Overlock = "overlock",
//   Side_Lupi = "side & lupi",
//   Belt = "belt",
//   Thoka_Bottom_Label = "thoka & bottom & label",
//   Final_Checking = "final checking",
// }

//define StageDetails interface
export interface StageDetails {
  [x: string]: any;
  stage: any;
  startTime: Date;
  endTime?: Date;
  expectedDeliveryDate: string;
  assignTo?: mongoose.Types.ObjectId | null;
  name?: string;
  contact?: string;
  isCompleted: boolean;
  additionalInformation?: string;
  lostPieces?: number;
  image?: string;
}

//define StageDetailsSchema schema
export const StageDetailsSchema = new mongoose.Schema<StageDetails>({
  stage: {
    type: String,
    default: "karigar",
    // enum: Object.values(StageEnum),
    // default: StageEnum.Karigar,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: false,
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
  name: {
    type: String,
    required: function () {
      return this.assignTo === null;
    },
  },
  contact: {
    type: String,
    required: function () {
      return this.assignTo === null;
    },
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  price: {
    type: String,
    required: true,
  },
  additionalInformation: {
    type: String,
    required: false,
  },
  lostPieces: {
    type: Number,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
});
