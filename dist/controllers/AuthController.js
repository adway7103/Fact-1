var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserType } from "../models/User.js";
export const registerC = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, username, password, phoneNo, userType } = req.body;
        if (!name || !username || !password || !phoneNo || !userType) {
            return res.status(400).json({ error: "Please enter all fields" });
        }
        // Map the string userType to the corresponding UserType enum
        const mappedUserType = Object.values(UserType).find((type) => type.toLowerCase() === userType.toLowerCase());
        if (!mappedUserType) {
            return res.status(400).json({ error: "Invalid user type" });
        }
        const existing = yield User.findOne({ username }).lean();
        if (existing) {
            return res.status(400).json({ error: "User already exists" });
        }
        const salt = yield bcrypt.genSalt(10);
        const hashedPassword = yield bcrypt.hash(password, salt);
        const user = yield User.create({
            name,
            username,
            password: hashedPassword,
            phoneNo,
            userType: mappedUserType, // Use the mapped UserType
        });
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "30d",
        });
        return res.status(201).json({ user, token });
    }
    catch (error) {
        return res.status(400).json({ error: error.message });
    }
});
export const loginC = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Please enter all fields" });
        }
        const user = yield User.findOne({ username }).lean();
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // if (user.firstTime) {
        //   user.firstTime = false;
        //   await user.save();
        // }
        const isPsswordMatch = yield bcrypt.compare(password, user.password);
        if (!isPsswordMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "30d",
        });
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
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
export const editUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, username, phoneNo, userType } = req.body;
        const user = yield User.findById(req.params.id);
        if (user) {
            user.name = name || user.name;
            user.username = username || user.username;
            user.phoneNo = phoneNo || user.phoneNo;
            user.userType = userType || user.userType;
            yield user.save();
            return res.status(200).json({ user });
        }
        return res.status(404).json({ error: "User not found" });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
export const fetchUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User.find();
        return res.status(200).json({ users });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
export const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.body;
        const user = yield User.findById(user_id);
        if (user) {
            return res.status(200).json({ user });
        }
        return res.status(404).json({ error: "User not found" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});
