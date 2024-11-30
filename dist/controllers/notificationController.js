var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ProductionModel } from "../models/Production.js";
import Lifecycle from "../models/Lifecycle.js";
export const notification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = `${tomorrow.getDate()}/${tomorrow.getMonth() + 1}/${tomorrow.getFullYear()}`;
    const notifications = [];
    //production
    const productionDueTomorrow = yield ProductionModel.find({
        markAsDone: false,
        expectedDeliveryDate: tomorrowStr,
    });
    if (productionDueTomorrow.length > 0) {
        const productionNotification = productionDueTomorrow
            .map((production) => {
            return production.rolls.map((roll) => {
                return {
                    type: "production",
                    id: production._id,
                    message: `The Roll number ${roll.rollNo} cutting delivery is expected to be tomorrow ${production.expectedDeliveryDate}.`,
                };
            });
        })
            .flat();
        notifications.unshift(...productionNotification);
    }
    else {
        return res.status(200).json({
            message: "No productions are due tomorrow.",
            notifications: [],
        });
    }
    //lifecycle
    const unDoneLifecycle = yield Lifecycle.find({ markAsDone: false });
    //   console.log(lifecycleStageDueTomorrow);
    if (unDoneLifecycle.length > 0) {
        const lifecycleNotifications = unDoneLifecycle
            .map((lot) => {
            return lot.stages
                .filter((stage) => !(stage === null || stage === void 0 ? void 0 : stage.isCompleted) && stage.expectedDeliveryDate === tomorrowStr)
                .map((stage) => {
                return {
                    type: "lifecycle",
                    id: lot._id,
                    message: `The Lot number ${lot === null || lot === void 0 ? void 0 : lot.lotNo} stage ${stage === null || stage === void 0 ? void 0 : stage.stage} is expected to complete by tomorrow ${stage.expectedDeliveryDate}.`,
                };
            });
        })
            .flat();
        notifications.unshift(...lifecycleNotifications);
    }
    return res.status(200).json({
        message: "Notifications triggered successfully.",
        notifications,
    });
});
