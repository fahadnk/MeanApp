import taskActivityRepository from "../repositories/taskActivity.repository.js";

class TaskActivityService {
  async log({ task, action, performedBy, changes = {} }) {
    return taskActivityRepository.log({
      task,
      action,
      performedBy,
      changes,
    });
  }

  async getTaskActivity(taskId) {
    return taskActivityRepository.getByTask(taskId);
  }
}

export default new TaskActivityService();
