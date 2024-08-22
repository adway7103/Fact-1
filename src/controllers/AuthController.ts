import User from "../models/User.js";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserType } from "../models/User.js";

export const registerC = async (req: Request, res: Response) => {
  try {
    const { name, username, password, phoneNo, userType } = req.body;

    if (!name || !username || !password || !phoneNo || !userType) {
      return res.status(400).json({ error: "Please enter all fields" });
    }

    // Map the string userType to the corresponding UserType enum
    const mappedUserType = Object.values(UserType).find(
      (type) => type.toLowerCase() === userType.toLowerCase()
    );

    if (!mappedUserType) {
      return res.status(400).json({ error: "Invalid user type" });
    }

    const existing = await User.findOne({ username }).lean();
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      username,
      password: hashedPassword,
      phoneNo,
      userType: mappedUserType, // Use the mapped UserType
    });

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "30d",
      }
    );

    return res.status(201).json({ user, token });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const loginC = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Please enter all fields" });
    }

    const user = await User.findOne({ username }).lean();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // if (user.firstTime) {
    //   user.firstTime = false;
    //   await user.save();
    // }

    const isPsswordMatch = await bcrypt.compare(password, user.password);

    if (!isPsswordMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "30d",
      }
    );
    return res.json({
      user: {
        _id: user._id,
        name: user.name,

        phoneNo: user.phoneNo,
        userType: user.userType,
        username: user.username,
      },
      token,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const editUser = async (req: Request, res: Response) => {
  try {
    const { name, username, phoneNo, userType } = req.body;
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = name || user.name;
      user.username = username || user.username;
      user.phoneNo = phoneNo || user.phoneNo;
      user.userType = userType || user.userType;

      await user.save();
      return res.status(200).json({ user });
    }
    return res.status(404).json({ error: "User not found" });
    
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
    
  }
}
export const fetchUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    return res.status(200).json({ users });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export const getUser = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;
    const user = await User.findById(user_id);
    if (user) {
      return res.status(200).json({ user });
    }
    return res.status(404).json({ error: "User not found" });
  } catch (error: any) {
    console.log(error)
    return res.status(500).json({ error: error.message });
  }
}
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { delete_user_id} = req.body;
    const deletedUser = await User.findByIdAndDelete(delete_user_id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
}