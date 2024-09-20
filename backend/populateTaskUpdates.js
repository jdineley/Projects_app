const mongoose = require("mongoose");
require("dotenv").config();

// mongoose models
const Task = require("./models/Task");

// util
const { generateRandomNumberBetweenMinMax } = require("./util");

// date-fns
const { format } = require("date-fns");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongo connection open!!");
    // const populate = async () => {
    async function createRandTaskCompHist() {
      const tasks = await Task.find();
      // console.log(tasks);
      const createRandTaskCompHistHandler = async (task) => {
        // console.log(task);
        //need a random task increase profile from the task creation to now.
        const currentLife = Date.now() - new Date(task.startDate).getTime();
        const lifespan =
          new Date(task.deadline).getTime() -
          new Date(task.startDate).getTime();

        const fractionOfTimeDone = currentLife / lifespan;
        // console.log("fraction of time complete", fractionOfTimeDone);

        const maxNumberOfUpdates = generateRandomNumberBetweenMinMax(6, 15);

        const realNumberOfUpdates = Math.floor(
          maxNumberOfUpdates * fractionOfTimeDone
        );

        // 0, 5, 15, 25, 30, 35....  random 5% or 10% increases between START & NOW

        // the time between updates should be randomised..  generate random time change array first to determine the number of updates:  [~start, randDat1, randDate2.... not entry greater than NOW]

        function randTimeIncrement(start, now, numOfUpdates) {
          const smallTimeInc = (now - start) / (numOfUpdates * 5);
          return smallTimeInc * generateRandomNumberBetweenMinMax(1, 6);
        }

        // console.log("real number of updates", realNumberOfUpdates);

        let timePercentUpdateProfile = [];
        let percentageUpdateProfile = [];
        let taskPercentIncProfile = new Map();

        let i = new Date(task.startDate).getTime();
        while (i < Date.now()) {
          const randTimeInc = randTimeIncrement(
            new Date(task.startDate).getTime(),
            Date.now(),
            realNumberOfUpdates
          );
          timePercentUpdateProfile.push(randTimeInc);
          i += randTimeInc;
        }
        timePercentUpdateProfile.pop();
        // for (
        //   let i = new Date(task.startDate).getTime();
        //   i < Date.now();
        //   i += randTimeIncrement(
        //     new Date(task.startDate).getTime(),
        //     Date.now(),
        //     realNumberOfUpdates
        //   )
        // ) {
        //   timePercentUpdateProfile.push(new Date(task.startDate).getTime() + i);
        // }

        timePercentUpdateProfile.forEach((time, i) => {
          percentageUpdateProfile.push(
            [0, 5, 10][Math.floor(Math.random() * [0, 5, 10].length)]
          );
          let totalPercent = percentageUpdateProfile.reduce((acc, cur) => {
            if (i === 0) return acc;
            return acc + cur;
          }, 0);

          if (totalPercent > 100) totalPercent = 100;

          const accumTime = timePercentUpdateProfile.reduce((acc, cur, j) => {
            if (j <= i) return acc + cur;
            else return acc;
          }, 0);

          taskPercentIncProfile.set(
            format(
              new Date(new Date(task.startDate).getTime() + accumTime),
              "MM/dd/yyyy"
            ),
            // new Date(Date.now() + accumTime).toLocaleString(),
            totalPercent
          );
        });
        // console.log("timePercentUpdateProfile", timePercentUpdateProfile);
        // console.log("percentageUpdateProfile", percentageUpdateProfile);
        // console.log("taskPercentIncProfile", taskPercentIncProfile);
        for (const [key, value] of taskPercentIncProfile) {
          // console.log("key", key);
          // console.log("value", value);
          task.percentageCompleteHistory.set(key, value);
          await task.save();
        }
        task.percentageComplete = Array.from(
          taskPercentIncProfile.values()
        ).pop();

        await task.save();
      };

      for (const task of tasks) {
        await createRandTaskCompHistHandler(task);
      }
    }
    // await createRandTaskCompHist();
    // };
    createRandTaskCompHist()
      .then(() => {
        mongoose.connection.close();
        console.log("Mongo connection closed");
      })
      .catch((err) => console.log(err));
  })
  .catch((err) => console.log(err));
