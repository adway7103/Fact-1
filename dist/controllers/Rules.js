var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Role from "../models/Role.js";
const AddPermissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { permission, role } = req.body;
        if (!permission || !role) {
            return res.status(400).json({ message: "Provide all fields" });
        }
        yield Role.findOneAndUpdate({ role: role }, { $addToSet: { permissions: permission } });
        res.status(200).json({ message: "Permission added successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
export default AddPermissions;
