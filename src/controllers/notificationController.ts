import { ProductionModel } from "../models/Production.js";
import Lifecycle from "../models/Lifecycle.js";
import { Request, Response } from "express";

export const notification = async (req: Request, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const tomorrowStr = `${tomorrow.getDate()}/${
    tomorrow.getMonth() + 1
  }/${tomorrow.getFullYear()}`;

  const notifications = [];

  //production
  const productionDueTomorrow = await ProductionModel.find({
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
  } else {
    return res.status(200).json({
      message: "No productions are due tomorrow.",
      notifications: [],
    });
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
