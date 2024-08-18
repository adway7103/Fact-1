import Role from "../models/Role.js";
import User from "../models/User.js";
import { Request, Response, NextFunction } from "express";

export const checkPermissions = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.body.user_id).lean();
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Ensure the role is found by exact match
      const role = await Role.findOne({ role: user.userType }).lean();
      if (!role) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!role.permissions.includes(permission)) {
        return res.status(403).json({ error: "You don't have permission for that" });
      }

      // If the user has permission, proceed to the next middleware or route handler
      next();
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  };
};
