import TaskActivity from "../models/taskActivity.model.js";

class TaskActivityRepository {
  async log({ task, action, performedBy, changes = {} }) {
    return TaskActivity.create({
      task,
      action,
      performedBy,
      changes,
    });
  }

  async getByTask(taskId) {
    return TaskActivity.find({ task: taskId })
      .populate("performedBy", "name email role")
      .sort({ createdAt: -1 })
      .lean();
  }
}

export default new TaskActivityRepository();
