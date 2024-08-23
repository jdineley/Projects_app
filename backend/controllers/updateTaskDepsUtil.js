//models
const Task = require("../models/Task");

async function updateTaskDepsUtil(task) {
  const taskStored = await Task.findOne({ msProjectGUID: task.GUID });
  const { dependencies } = task;
  // could reset dependencies first
  taskStored.dependencies = [];
  if (dependencies?.length > 0) {
    for (const dep of dependencies) {
      const precedingTask = await Task.findOne({ msProjectGUID: dep });
      // console.log("world", precedingTask);
      taskStored.dependencies.push(precedingTask._id);
      // or...
      // (this might need .map.toString() to get the dependencies array in shap for the includes method)
      // if (!taskStored.dependencies.includes(precedingTask._id)) {
      //   taskStored.dependencies.push(precedingTask._id);
      // }
    }
    await taskStored.save();
  }
}

module.exports = { updateTaskDepsUtil };
