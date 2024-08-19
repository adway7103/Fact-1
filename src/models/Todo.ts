import mongoose from "mongoose";

export enum TodoType {
    Todo1 = "todo1",
    Todo2 = "todo2",
    Todo3 = "todo3",
  }

const TodoSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    status:{
        type: Boolean,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    todo_type: {
        type: String,
        required: true,
        enum: TodoType,
        default: TodoType.Todo1
    }


})

export default mongoose.model("Todo", TodoSchema);