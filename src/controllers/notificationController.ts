import { ProductionModel } from "../models/Production.js";
import Lifecycle from "../models/Lifecycle.js";
import { Request, Response } from "express";

export const notification = async (req: Request, res: Response) => {
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
  const productionDue = await ProductionModel.find({
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

    notifications.push(
      ...productionTodayNotification,
      ...productionTomorrowNotification
    );
  }

  //lifecycle
  const unDoneLifecycle = await Lifecycle.find({ markAsDone: false });
  //   console.log(lifecycleStageDueTomorrow);

  if (unDoneLifecycle.length > 0) {
    const lifecycleNotifications = unDoneLifecycle
      .map((lot) => {
        return lot.stages
          .filter(
            (stage) =>
              !stage?.isCompleted && stage.expectedDeliveryDate === tomorrowStr
          )
          .map((stage) => {
            return {
              type: "lifecycle",
              id: lot._id,
              message: `The Lot number ${lot?.lotNo} stage ${stage?.stage} is expected to complete by tomorrow ${stage.expectedDeliveryDate}.`,
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
};
