import Todo from "../models/Todo.js";
import { Request, Response } from "express";
import { TodoType } from "../models/Todo.js";

export const addTask = async (req: Request, res: Response) => {
  try {
    const { title, description, user_id, todo_type } = req.body;

    // Validate todo_type
    if (!Object.values(TodoType).includes(todo_type)) {
      return res.status(400).json({ error: "Invalid todo type" });
    }

    const task = await Todo.create({
      title,
      description,
      status: false,
      user: user_id,
      todo_type: todo_type as TodoType,
    });

    return res.status(201).json({ task });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const {user_id} = req.body;
    const tasks = await Todo.find({ user: user_id });
    return res.status(200).json({ tasks });
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error" });
  }
};



export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { task_id } = req.body;
    const updatedTask = await Todo.findByIdAndUpdate(task_id, {
      status: true,
    }, { new: true });

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({ message: "Updated successfully", updatedTask });
  } catch (error: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { task_id, user_id } = req.body;

    // Find the task by its ID
    const task:any = await Todo.findById(task_id);

    // Check if the task exists
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if the user ID matches the task's user ID
    if (task.user.toString() !== user_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Delete the task
    await task.remove();

    return res.status(200).json({ message: "Deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

