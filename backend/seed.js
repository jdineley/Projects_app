const mongoose = require("mongoose");
require("dotenv").config();

const {
  generateRandomElement,
  generateRandomNumberBetweenMinMax,
  getMidTermDate,
  createReviewObjectives,
  createReviewActions,
  resyncUserAndVacs,
} = require("./util");

const {
  subWeeks,
  subMonths,
  addMonths,
  isPast,
  addWeeks,
  isAfter,
} = require("date-fns");

const Project = require("./models/Project");
const Task = require("./models/Task");
const User = require("./models/User");
const Comment = require("./models/Comment");
const Reply = require("./models/Reply");
const Review = require("./models/Review");
const ReviewObjective = require("./models/ReviewObjective");
const ReviewAction = require("./models/ReviewAction");
const Vacation = require("./models/Vacation");
const Tenant = require("./models/Tenant");

// Seed data
const {
  projects,
  users,
  tasks,
  comments,
  // projectReviewObjectives,
} = require("./seedData");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongo connection open!!");
    const seedDb = async () => {
      try {
        await Project.deleteMany({});
        await User.deleteMany({});
        await Task.deleteMany({});
        await Comment.deleteMany({});
        await Reply.deleteMany({});
        await Review.deleteMany({});
        await ReviewObjective.deleteMany({});
        await ReviewAction.deleteMany({});
        await Vacation.deleteMany({});
        await Tenant.deleteMany({}); //OPTIONAL

        // await Project.deleteMany({ isDemo: true });
        // await User.deleteMany({ isDemo: true });
        // await Task.deleteMany({ isDemo: true });
        // await Comment.deleteMany({ isDemo: true });
        // await Reply.deleteMany({ isDemo: true });
        // await Review.deleteMany({ isDemo: true });
        // await ReviewObjective.deleteMany({ isDemo: true });
        // await ReviewAction.deleteMany({ isDemo: true });
        // await Vacation.deleteMany({ isDemo: true });

        // delete everything related to demo users:
        // const demoUsers = await User.find({ demo: true });

        // async function clearDemoUsers(demoUsers) {
        //   const cascadeDeleteHandler = async (demoUser) => {
        //     const childrenDocs = [
        //       ["tasks", Task],
        //       ["secondaryTasks", Task],
        //       ["comments", Comment],
        //       ["projects", Project],
        //       ["vacationRequests", Vacation],
        //       ["archivedProjects", Project],
        //     ];
        //     for (const childDoc of childrenDocs) {
        //       if (demoUser[childDoc[0]].length > 0) {
        //         for (const childDocId of demoUser[childDoc[0]]) {
        //           await childDoc[1].findByIdAndDelete(childDocId);
        //         }
        //       }
        //     }
        //   };
        //   for (const demoUser of demoUsers) {
        //     await cascadeDeleteHandler(demoUser);
        //   }
        // }
        // await clearDemoUsers(demoUsers);

        // Create users #1
        async function createUsers() {
          const userCreateHandler = async (user) => {
            const demoUser = await User.signUp({
              email: user.email,
              password: user.password,
              isDemo: true,
            });
            // demoUser.isDemo = true;
            // await demoUser.save();
          };
          for (const user of users) {
            await userCreateHandler(user);
          }
        }
        await createUsers();
        const savedUsers = await User.find({ isDemo: true });
        const userIds = savedUsers.map((user) => user._id);
        // still requires tasks & comments & projects - complete

        // Create projects #1
        async function createProjects() {
          const projectCreateHandler = async (project) => {
            const owner_id = generateRandomElement(userIds);
            const owner = await User.findById(owner_id);

            const newProject = await Project.create({
              ...project,
              start: subMonths(
                new Date(Date.now()),
                generateRandomNumberBetweenMinMax(10, 16)
              ),
              end: addMonths(
                new Date(Date.now()),
                generateRandomNumberBetweenMinMax(6, 12)
              ),
              owner: owner_id,
              isDemo: true,
            });

            const midTermReview = await Review.create({
              title: "mid-term",
              date:
                Math.random() >= 0.5
                  ? subWeeks(
                      new Date(
                        getMidTermDate(newProject.start, newProject.end)
                      ),
                      generateRandomNumberBetweenMinMax(4, 16)
                    )
                  : addWeeks(
                      new Date(
                        getMidTermDate(newProject.start, newProject.end)
                      ),
                      generateRandomNumberBetweenMinMax(4, 16)
                    ),
              project: newProject._id,
              isDemo: true,
              // objectives: createReviewObjectives(projectReviewObjectives, this._id, userIds),
            });
            // console.log(midTermReview);

            const endOfProjectReview = await Review.create({
              title: "end of project",
              date: subWeeks(new Date(newProject.end), 6),
              project: newProject._id,
              isDemo: true,
              // objectives: createReviewObjectives(projectReviewObjectives),
            });

            if (isPast(new Date(midTermReview.date))) {
              midTermReview.complete = true;
              await midTermReview.save();
            }
            if (isPast(new Date(endOfProjectReview.date))) {
              endOfProjectReview.complete = true;
              await endOfProjectReview.save();
            }

            newProject.reviews.push(midTermReview, endOfProjectReview);
            await newProject.save();

            owner.projects.push(newProject._id);
            await owner.save();
          };

          for (const project of projects) {
            await projectCreateHandler(project);
          }
        }
        await createProjects();
        const savedProjects = await Project.find();
        const projectIds = savedProjects.map((project) => project._id);
        // requires reviews

        // Create tasks #1
        async function createTasks() {
          const taskCreateHandler = async (task) => {
            const user_id = generateRandomElement(userIds);
            const project_id = generateRandomElement(projectIds);

            const project = await Project.findById(project_id);
            const user = await User.findById(user_id);

            // add dynamic deadline:
            let deadline = addMonths(
              new Date(Date.now()),
              generateRandomNumberBetweenMinMax(4, 8)
            );
            if (isAfter(new Date(deadline), new Date(project.end))) {
              deadline = subWeeks(
                new Date(project.end),
                generateRandomNumberBetweenMinMax(2, 6)
              );
            }

            // newTask.deadline = new Date(deadline);

            // add dynamic startDate:
            let startDate = addMonths(
              new Date(project.start),
              generateRandomNumberBetweenMinMax(0, 14)
            );
            if (isAfter(new Date(startDate), new Date(deadline))) {
              deadline = subMonths(
                new Date(deadline),
                generateRandomNumberBetweenMinMax(2, 6)
              );
            }
            // newTask.startDate = new Date(startDate);

            // await newTask.save();

            // console.log("deadline", deadline);
            // console.log("startDate", startDate);

            const newTask = await Task.create({
              ...task,
              user: user_id,
              project: project_id,
              // percentageComplete: generateRandomElement([
              //   0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
              // ]),
              // createdAt: addMonths(
              //   new Date(project.start),
              //   generateRandomNumberBetweenMinMax(2, 9)
              // ),
              daysToComplete: generateRandomNumberBetweenMinMax(5, 90),
              startDate,
              deadline,
              isDemo: true,
            });

            project.tasks.push(newTask._id);
            user.tasks.push(newTask._id);

            // populate userInProject array
            // if (
            //   !user.userInProjects.includes(newTask.project) &&
            //   !user.projects.includes(newTask.project)
            // ) {
            //   user.userInProjects.push(newTask.project);
            // }
            // console.log(
            //   "project owner",
            //   project.owner,
            //   project.owner.toString()
            // );
            // console.log("user._id", user._id);
            if (project.owner.toString() !== user._id.toString()) {
              // populate user.userInProject[]:
              user.userInProjects = user.userInProjects
                .map((projId) => projId.toString())
                .concat(project._id.toString())
                .filter((projId, i, ar) => ar.indexOf(projId) === i);
              // populate project.users[]:
              project.users = project.users
                .map((userId) => userId.toString())
                .concat(user._id.toString())
                .filter((userId, i, ar) => ar.indexOf(userId) === i);
            }

            await project.save();
            await user.save();
          };
          for (const task of tasks) {
            await taskCreateHandler(task);
          }
        }
        await createTasks();

        const storedTasks = await Task.find();
        const taskIds = storedTasks.map((task) => task._id);

        // Create Comments #1
        async function createComments() {
          const commentCreateHandler = async (comment) => {
            const user_id = generateRandomElement(userIds);
            const task_id = generateRandomElement(taskIds);
            const user = await User.findById(user_id);
            const task = await Task.findById(task_id);

            const newComment = await Comment.create({
              ...comment,
              user: user._id,
              task: task._id,
              project: task.project,
              isDemo: true,
            });
            task.comments.push(newComment._id);
            user.comments.push(newComment._id);

            await task.save();
            await user.save();
          };
          for (const comment of comments) {
            await commentCreateHandler(comment);
          }
        }
        await createComments();
        const storedComments = await Comment.find();
        const commentIds = storedComments.map((comment) => comment._id);

        async function createReplies() {
          const replyCreateHandler = async (reply) => {
            const comment_id = generateRandomElement(commentIds);
            const user_id = generateRandomElement(userIds);
            const comment = await Comment.findById(comment_id);
            const user = await User.findById(user_id);

            const newReply = await Reply.create({
              ...reply,
              comment: comment_id,
              project: comment.project,
              user: user._id,
              isDemo: true,
            });

            comment.replies.push(newReply._id);
            await comment.save();
          };
          // note reply is equivelent to comment
          for (const reply of comments) {
            await replyCreateHandler(reply);
          }
          // X2 THE LOOP TO INCREASE THE POPULATION OF REPLIES
          // for (const reply of comments) {
          //   await replyCreateHandler(reply);
          // }
        }
        await createReplies();

        //  POPULATE THE DEPENDENCY ARRAY
        async function populateDependencies() {
          const populateDependenciesHandler = async () => {
            const task_id = generateRandomElement(taskIds);
            const filteredTasks1 = taskIds.filter((t) => t !== task_id);
            const task_id_dep1 = generateRandomElement(filteredTasks1);
            const filteredTasks2 = filteredTasks1.filter(
              (t) => t !== task_id_dep1
            );
            const task_id_dep2 = generateRandomElement(filteredTasks2);

            const task = await Task.findById(task_id);

            // randomise the dependency array:
            const dependencyArrayoptions = [
              [task_id_dep1, task_id_dep2],
              [task_id_dep2],
              [task_id_dep1],
              [],
            ];

            task.dependencies = generateRandomElement(dependencyArrayoptions);
            let depsPercentCompleteArray;
            if (task.dependencies.length > 0) {
              depsPercentCompleteArray = task.dependencies
                .map(async (taskId) => await Task.findById(taskId))
                .map((taskObj) => taskObj.percentageComplete);
            } else {
              return;
            }

            if (task.percentageComplete === 100) {
              if (task.dependencies.length === 0) {
                task.completed = true;
                await task.save();
              }
              if (
                !depsPercentCompleteArray.some((dep) =>
                  [0, 25, 50, 75].includes(dep)
                )
              ) {
                task.completed = true;
                await task.save();
              }
            } else {
              await task.save();
            }
          };
          for (const task of tasks) {
            await populateDependenciesHandler(task);
          }
        }
        await populateDependencies();

        const tasksArray = await Task.find();
        const totalDeps = tasksArray.reduce((acc, cur) => {
          return acc + cur.dependencies.length;
        }, 0);

        console.log("total tasks:", tasksArray.length);
        console.log("totalDeps:", totalDeps);

        //OTHER THINGS TO DO:
        // - MAKE EACH TASK HAVE A CERTAIN PERCENTAGE COMPLETE
        // - TASK COMPLETE BOOLEAN CAN BE TRUE IF ALL DEPENDENCIES ARE COMPLETE TRUE AND TASK PERCENTAGE IS 100%
        // -
      } catch (error) {
        console.log(error);
      }
    };

    seedDb()
      .then(() => {
        mongoose.connection.close();
        console.log("Mongo connection closed");
      })
      .catch((err) => console.log(err));
  })
  .catch((err) => console.log(err));
