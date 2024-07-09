const mongoose = require("mongoose");

const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");
const Comment = require("../models/Comment");

const { channel } = require("../routes/v1/sse");

// date-fns
const { format } = require("date-fns");

const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({
      createdAt: -1,
    });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// get searched tasks
const getTasks = async (req, res) => {
  console.log("hit getTasks route");
  const { task } = req.query;
  console.log(task === "");
  if (task === "") {
    res.status(200).json([]);
    return;
  }
  const searchedTasks = await Task.find({
    title: { $regex: task, $options: "i" },
  });
  res.status(200).json(searchedTasks);
};

// get a task
const getTask = async (req, res) => {
  const { taskId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(404).json({ error: "No such task" });
  }
  try {
    const task = await Task.findById(taskId).populate([
      "user",
      "project",
      "dependencies",
    ]);
    if (!task) {
      return res.status(404).json({ error: "No such task" });
    }
    const taskComments = [];
    if (task.comments.length > 0) {
      for (const comment of task.comments) {
        const populatedComment = await Comment.findById(comment).populate([
          "user",
          "content",
          "replies",
        ]);
        taskComments.push(populatedComment);
      }
    }

    res.status(200).json({ task, taskComments });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// create a task
const createTask = async (req, res) => {
  console.log("hit create task route");
  const { projectId } = req.params;
  const { assigneeId } = req.body;
  console.log(req.body);

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(404).json({ error: "No such project" });
  }

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "No such project" });
    }
    if (assigneeId) {
      const assignee = await User.findById(assigneeId);
      req.body.user = assignee._id;
    }
    const task = await Task.create({
      user: req.user._id,
      project: projectId,
      ...req.body,
    });
    const user = await User.findById(task.user);
    project.tasks.push(task._id);
    user.tasks.push(task._id);

    await project.save();
    await user.save();
    res.status(200).json(task);
    console.log("just before pub new task", task.user, req.user._id);
    if (task.user.toString() !== req.user._id.toString()) {
      user.recievedNotifications.push(
        `/projects/${projectId}?taskId=${task._id}&user=${req.user.email}&projectTitle=${project.title}&intent=new-task`
      );
      // user.recentReceivedTasks.push(
      //   `/projects/${projectId}?taskId=${task._id}&user=${req.user.email}&projectTitle=${project.title}&intent=new-task`
      // );
      await user.save();

      channel.publish(
        `/projects/${projectId}?taskId=${task._id}&user=${req.user.email}&projectTitle=${project.title}&intent=new-task`,
        `new-task-notification${task.user}`
      );
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// update a task
const updateTask = async (req, res) => {
  console.log("hit update task route");
  console.log(req.body);
  const { taskId } = req.params;
  const { dependencies, editPercent, ...list } = req.body;

  if (editPercent === "true") {
    req.body = list;
  }

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(404).json({ error: "No such task" });
  }

  try {
    const taskToUpdate = await Task.findById(taskId);
    if (!taskToUpdate) {
      return res.status(404).json({ error: "No such task" });
    }
    if (taskToUpdate.user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Not authorised to update task" });
    }
    if (editPercent === "true") {
      taskToUpdate.percentageCompleteHistory.set(
        format(new Date(), "MM/dd/yyyy"),
        req.body.percentageComplete
      );
      await taskToUpdate.save();
    }

    taskToUpdate.percentageCompleteHistory;
    const task = await Task.findOneAndUpdate(
      { _id: taskId },
      {
        title: taskToUpdate.title,
        description: taskToUpdate.description,
        completed: taskToUpdate.completed,
        user: taskToUpdate.user,
        project: taskToUpdate.project,
        deadline: taskToUpdate.deadline,
        percentageComplete: taskToUpdate.percentageComplete,
        dependencies: taskToUpdate.dependencies,
        ...req.body,
      },
      {
        returnDocument: "after",
      }
    );
    if (!task) {
      return res.status(404).json({ error: "No such task" });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete a task
const deleteTask = async (req, res) => {
  console.log("hit delete task route");
  const { taskId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return res.status(404).json({ error: "No such task" });
  }

  try {
    const taskToDelete = await Task.findById(taskId);
    if (!taskToDelete) {
      return res.status(404).json({ error: "No such task" });
    }
    if (taskToDelete.user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Not authorised to delete task" });
    }
    const task = await Task.findByIdAndDelete(taskId);
    if (!task) {
      return res.status(404).json({ error: "No such task" });
    }
    const taskUser = await User.findById(task.user);
    const taskProject = await Project.findById(task.project);
    if (taskUser) {
      taskUser.tasks = taskUser.tasks.filter((tasks) => {
        return task.toString() !== taskId;
      });
    }
    if (taskProject) {
      taskProject.tasks = taskProject.tasks.filter((task) => {
        return task.toString() !== taskId;
      });
    }
    await taskUser.save();
    await taskProject.save();
    if (task.comments.length > 0) {
      for (const comment of task.comments) {
        await Comment.findByIdAndDelete(comment);
      }
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports = {
  getAllTasks,
  getTask,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
