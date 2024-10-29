import mongoose from "mongoose";
import "dotenv/config";
//define stage enum
export var StageEnum;
(function (StageEnum) {
    StageEnum["Karigar"] = "karigar";
    StageEnum["Checking"] = "checking";
    StageEnum["FeedOff"] = "feedoff";
    StageEnum["Overlock"] = "overlock";
    StageEnum["Side_Lupi"] = "side & lupi";
    StageEnum["Belt"] = "belt";
    StageEnum["Thoka_Bottom_Label"] = "thoka & bottom & label";
    StageEnum["Final_Checking"] = "final checking";
})(StageEnum || (StageEnum = {}));
//define StageDetailsSchema schema
export const StageDetailsSchema = new mongoose.Schema({
    stage: {
        type: String,
        enum: Object.values(StageEnum),
        default: StageEnum.Karigar,
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
});
