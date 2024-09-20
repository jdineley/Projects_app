//models
const Task = require("../models/Task");

async function updateTaskDepsUtil(task) {
  console.log("in updateTaskDepsUtil");
  const taskStored = await Task.findOne({ msProjectGUID: task.GUID });
  console.log("taskStored", taskStored);
  const { dependencies } = task;
  // could reset dependencies first
  taskStored.dependencies = [];
  if (dependencies?.length > 0) {
    for (const dep of dependencies) {
      const precedingTask = await Task.findOne({ msProjectGUID: dep });
      console.log("precedingTask", precedingTask);
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
