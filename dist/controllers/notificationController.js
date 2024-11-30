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
    const formatter = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
    const todayStr = formatter.format(today);
    const tomorrowStr = formatter.format(tomorrow);
    const notifications = [];
    //production
    const productionDue = yield ProductionModel.find({
        markAsDone: false,
        expectedDeliveryDate: { $in: [todayStr, tomorrowStr] },
    });
    if (productionDue.length > 0) {
        const productionTodayNotification = productionDue
            .filter((production) => production.expectedDeliveryDate === todayStr)
            .map((production) => {
            return production.rolls.map((roll) => {
                return {
                    type: "production",
                    id: production._id,
                    message: `The Roll number ${roll.rollNo} cutting is expected to be delivered today ${production.expectedDeliveryDate}.`,
                };
            });
        })
            .flat();
        const productionTomorrowNotification = productionDue
            .filter((production) => production.expectedDeliveryDate === tomorrowStr)
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
        notifications.push(...productionTodayNotification, ...productionTomorrowNotification);
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
