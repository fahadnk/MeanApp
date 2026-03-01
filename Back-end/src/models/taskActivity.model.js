import mongoose from "mongoose";

const TaskActivitySchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    action: {
      type: String,
      required: true,
      enum: [
        "TASK_CREATED",
        "TASK_UPDATED",
        "STATUS_CHANGED",
        "ASSIGNED_CHANGED",
        "PRIORITY_CHANGED",
        "TASK_DELETED",
      ],
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    changes: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("TaskActivity", TaskActivitySchema);
