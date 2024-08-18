import Role from "../models/Role.js";
import { Request, Response } from "express";
import { UserType } from "../models/User.js";

const AddPermissions = async (req: Request, res: Response) => {
  try {
    const { permission, role } = req.body;

    if (!permission || !role) {
      return res.status(400).json({ message: "Provide all fields" });
    }

    await Role.findOneAndUpdate(
      { role: role },
      { $addToSet: { permissions: permission } }
    );

    res.status(200).json({ message: "Permission added successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export default AddPermissions;
