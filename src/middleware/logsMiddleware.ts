import Log from "../models/LogsModel.js";
import { NextFunction, Request, Response } from "express";

const logMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  if (req.method !== "GET") {
    res.on("finish", async () => {
      try {
        const logEntry = {
          user: req.body.user_id || "Anonymous", 
          action: `${req.method} ${req.originalUrl}`, 
          details: res.locals.createdDocument || req.body,
          timestamp: new Date(), 
        };

        await Log.create(logEntry); 
      } catch (error) {
        console.error("Failed to log action:", error);
      }
    });
  }

  next(); 
};

export default logMiddleware;
