import Role from "../models/Role.js";
import { Request, Response } from "express";
import { UserType } from "../models/User.js";

const AddPermissions = async (req: Request, res: Response) => {
  try {
    const { permission, role } = req.body;

    if (!permission || !role) {
      return res.status(400).json({ message: "Provide all fields" });
    }

    // Convert the role to lowercase to match the UserType enum
    const mappedRole = Object.values(UserType).find(
      (userType) => userType.toLowerCase() === role.toLowerCase()
    );

    if (!mappedRole) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingRole = await Role.findOne({ role: mappedRole });

    if (existingRole) {
      await Role.findOneAndUpdate(
        { role: mappedRole },
        { $addToSet: { permissions: permission } }
      );
      return res.status(200).json({ message: "Permission added successfully" });
    } else {
      const newRole = new Role({
        role: mappedRole,
        permissions: [permission],
      });
      await newRole.save();
      return res.status(201).json({ message: "Role created and permission added successfully" });
    }
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export default AddPermissions;
