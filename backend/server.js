require("dotenv").config();
const mongoose = require("mongoose");

const express = require("express");
const cors = require("cors");

const taskRoutes = require("./routes/v1/tasks");
const projectRoutes = require("./routes/v1/projects");
const userRoutes = require("./routes/v1/user");
const commentRoutes = require("./routes/v1/comments");
const replyRoutes = require("./routes/v1/replies");
const { router: sseRoutes } = require("./routes/v1/sse");
const reviewRoutes = require("./routes/v1/reviews");
const reviewObjectivesRoutes = require("./routes/v1/reviewObjectives");
const reviewActionRoutes = require("./routes/v1/reviewActions");
const vacationRoutes = require("./routes/v1/vacations");
const helmet = require("helmet");

// express app
const app = express();

// middleware
app.use(express.json());
app.use(helmet());
app.use(cors());

// routes
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/replies", replyRoutes);
app.use("/api/v1", sseRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/reviewObjectives", reviewObjectivesRoutes);
app.use("/api/v1/reviewActions", reviewActionRoutes);
app.use("/api/v1/vacations", vacationRoutes);

// connect to the db (async) and spin up server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to the db");
    app.listen(process.env.PORT, () => {
      console.log("Server listening on port" + " " + process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
