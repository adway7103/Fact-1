var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Logs from "../models/LogsModel.js";
const fetchActivityLogs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activityLogs = yield Logs.find().populate({
            path: "user",
            select: "name",
        });
        const reversedLogs = activityLogs.reverse();
        res.status(200).json({
            message: "Activity Logs fetched successfully.",
            activityLogs: reversedLogs,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching activity logs.",
            error: error.message,
        });
    }
});
export default fetchActivityLogs;