var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Todo from "../models/Todo.js";
import { TodoType } from "../models/Todo.js";
export const addTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, user_id, todo_type } = req.body;
        // Validate todo_type
        if (!Object.values(TodoType).includes(todo_type)) {
            return res.status(400).json({ error: "Invalid todo type" });
        }
        const task = yield Todo.create({
            title,
            description,
            status: false,
            user: user_id,
            todo_type: todo_type,
        });
        return res.status(201).json({ task });
    }
    catch (error) {
        return res.status(400).json({ error: error.message });
    }
});
export const getAllTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.body;
        const tasks = yield Todo.find({ user: user_id });
        return res.status(200).json({ tasks });
    }
    catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});
export const updateStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { task_id } = req.body;
        const updatedTask = yield Todo.findByIdAndUpdate(task_id, {
            status: true,
        }, { new: true });
        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }
        return res.status(200).json({ message: "Updated successfully", updatedTask });
    }
    catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});
export const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { task_id, user_id } = req.body;
        // Find the task by its ID
        const task = yield Todo.findById(task_id);
        // Check if the task exists
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        // Check if the user ID matches the task's user ID
        if (task.user.toString() !== user_id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Delete the task
        yield task.remove();
        return res.status(200).json({ message: "Deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});
