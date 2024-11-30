import Logs from "../models/LogsModel.js";
import { Request, Response } from "express";

const fetchActivityLogs = async (req: Request, res: Response) => {
  try {
    const activityLogs = await Logs.find().populate({
      path: "user",
      select: "name",
    });

    const reversedLogs = activityLogs.reverse();

    res.status(200).json({
      message: "Activity Logs fetched successfully.",
      activityLogs: reversedLogs,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error fetching activity logs.",
      error: error.message,
    });
  }
};

export default fetchActivityLogs;
