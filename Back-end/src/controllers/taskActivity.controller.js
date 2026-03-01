import taskActivityService from "../services/taskActivity.service.js";
import { success, error } from "../utils/response.js";

class TaskActivityController {
  async getByTask(req, res) {
    try {
      const logs = await taskActivityService.getTaskActivity(req.params.taskId);
      return success(res, logs, "Task activity fetched");
    } catch (err) {
      return error(res, err.message, 400);
    }
  }
}

export default new TaskActivityController();
