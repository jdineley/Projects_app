const mongoose = require("mongoose");

const Vacation = require("../models/Vacation");
const User = require("../models/User");
const Project = require("../models/Project");

const { channel } = require("../routes/v1/sse");

const {
  isWithinInterval,
  differenceInBusinessDays,
  format,
} = require("date-fns");

const getVacation = async (req, res) => {};

const createVacation = async (req, res) => {
  console.log("hit requestUserVacation route");
  //receive array of objects [{lastWorkDate: ..., returnToWorkDate: ...},{},{}] or
  //only one vacation per request...
  const { lastWorkDate, returnToWorkDate } = req.body;
  try {
    const vacation = await Vacation.create({
      ...req.body,
      user: req.user._id,
    });
    // console.log("User");
    const user = await User.findById(req.user._id).populate("vacationRequests");
    const totalNonRejectedVacationsDays =
      user.vacationRequests.length > 0
        ? user.vacationRequests.reduce((acc, cur) => {
            if (cur.status !== "rejected") {
              acc += differenceInBusinessDays(
                cur.returnToWorkDate,
                cur.lastWorkDate
              );
            }
            return acc;
          }, 0)
        : 0;
    // console.log("totalNonRejectedVacationsDays", totalNonRejectedVacationsDays);
    user.remainingVacationDays =
      user.vacationAllocation -
      (differenceInBusinessDays(returnToWorkDate, lastWorkDate) +
        totalNonRejectedVacationsDays);
    // const userRemainingVacDays =
    //   user.remainingVacationDays -
    //   differenceInBusinessDays(returnToWorkDate, lastWorkDate);
    // if (userRemainingVacDays >= 0) {
    //   user.remainingVacationDays = userRemainingVacDays;
    //   await user.save();
    // } else {
    //   throw new Error("User doesnt have sufficient vacation days remaining");
    // }

    for (const projId of user.userInProjects) {
      const proj = await Project.findById(projId);
      const projOwner = await User.findById(proj.owner);
      if (
        isWithinInterval(new Date(lastWorkDate), {
          start: new Date(proj.start),
          end: new Date(proj.end),
        }) ||
        isWithinInterval(new Date(returnToWorkDate), {
          start: new Date(proj.start),
          end: new Date(proj.end),
        })
      ) {
        // console.log(projOwner.email);
        projOwner.recievedNotifications.push(
          `/user?vacationId=${vacation._id}&user=${
            req.user.email
          }&date=${format(new Date(lastWorkDate), "MM/dd/yyyy")}-${format(
            new Date(returnToWorkDate),
            "MM/dd/yyyy"
          )}&intent=vacation-request`
        );
        // projOwner.recentReceivedVacRequest.push(
        //   `/user?vacationId=${vacation._id}&user=${
        //     req.user.email
        //   }&date=${format(new Date(lastWorkDate), "MM/dd/yyyy")}-${format(
        //     new Date(returnToWorkDate),
        //     "MM/dd/yyyy"
        //   )}&intent=vacation-request`
        // );
        await projOwner.save();
        channel.publish(
          `/user?vacationId=${vacation._id}&user=${
            req.user.email
          }&date=${format(new Date(lastWorkDate), "MM/dd/yyyy")}-${format(
            new Date(returnToWorkDate),
            "MM/dd/yyyy"
          )}&intent=vacation-request`,
          `new-vacation-notification${proj.owner}`
        );
        proj.vacationRequests.push(vacation._id);
        await proj.save();
        vacation.projects.push(projId);
        await vacation.save();
      }
    }

    user.vacationRequests.push(vacation._id);
    await user.save();
    res.status(200).json(vacation);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const updateVacation = async (req, res) => {
  console.log("hit updateVacation route");

  const {
    vacationAccepted,
    reasonForRejection,
    vacationApproval,
    projectId,
    vacationId,
  } = req.body;
  console.log(vacationId, vacationApproval, reasonForRejection);

  if (!mongoose.Types.ObjectId.isValid(vacationId)) {
    return res.status(404).json({ error: "No such vacation" });
  }

  try {
    const vacationToUpdate = await Vacation.findById(vacationId);
    if (!vacationToUpdate) {
      return res.status(404).json({ error: "No such vacation" });
    }
    const user = await User.findById(vacationToUpdate.user);

    if (vacationApproval) {
      user.vacStatChange = true;
      vacationToUpdate.approvals.set(projectId, {
        accepted: vacationAccepted,
        reason: vacationAccepted === "false" ? reasonForRejection : null,
      });
      await vacationToUpdate.save();

      if (vacationAccepted === "true") {
        user.recievedNotifications.push(
          `/user?vacationId=${vacationToUpdate._id}&user=${
            req.user.email
          }&date=${format(
            new Date(vacationToUpdate.lastWorkDate),
            "MM/dd/yyyy"
          )}-${format(
            new Date(vacationToUpdate.returnToWorkDate),
            "MM/dd/yyyy"
          )}&intent=vacation-accepted`
        );
        // user.recentReceivedVacAccepted.push(
        //   `/user?vacationId=${vacationToUpdate._id}&user=${
        //     req.user.email
        //   }&date=${format(
        //     new Date(vacationToUpdate.lastWorkDate),
        //     "MM/dd/yyyy"
        //   )}-${format(
        //     new Date(vacationToUpdate.returnToWorkDate),
        //     "MM/dd/yyyy"
        //   )}&intent=vacation-accepted`
        // );
        // await user.save();
        channel.publish(
          `/user?vacationId=${vacationToUpdate._id}&user=${
            req.user.email
          }&date=${format(
            new Date(vacationToUpdate.lastWorkDate),
            "MM/dd/yyyy"
          )}-${format(
            new Date(vacationToUpdate.returnToWorkDate),
            "MM/dd/yyyy"
          )}&intent=vacation-accepted`,
          `vacation-accepted-notification${vacationToUpdate.user}`
        );
      }

      // maintain sync between approvals/status/approved:-
      const approvalValuesArray = Object.values(
        Object.fromEntries(vacationToUpdate.approvals)
      ).map((approv) => approv.accepted);
      // console.log(approvalValuesArray);
      if (
        approvalValuesArray.length === vacationToUpdate.projects.length &&
        !approvalValuesArray.includes("false")
      ) {
        vacationToUpdate.status = "approved";
        vacationToUpdate.approved = true;
        await vacationToUpdate.save();

        user.recievedNotifications.push(
          `/user?vacationId=${vacationToUpdate._id}&date=${format(
            new Date(vacationToUpdate.lastWorkDate),
            "MM/dd/yyyy"
          )}-${format(
            new Date(vacationToUpdate.returnToWorkDate),
            "MM/dd/yyyy"
          )}&intent=vacation-approval`
        );
        // user.recentReceivedVacApproved.push(
        //   `/user?vacationId=${vacationToUpdate._id}&date=${format(
        //     new Date(vacationToUpdate.lastWorkDate),
        //     "MM/dd/yyyy"
        //   )}-${format(
        //     new Date(vacationToUpdate.returnToWorkDate),
        //     "MM/dd/yyyy"
        //   )}&intent=vacation-approval`
        // );
        // await user.save();

        channel.publish(
          `/user?vacationId=${vacationToUpdate._id}&date=${format(
            new Date(vacationToUpdate.lastWorkDate),
            "MM/dd/yyyy"
          )}-${format(
            new Date(vacationToUpdate.returnToWorkDate),
            "MM/dd/yyyy"
          )}&intent=vacation-approval`,
          `vacation-approved-notification${vacationToUpdate.user}`
        );
      } else if (approvalValuesArray.includes("false")) {
        user.recievedNotifications.push(
          `/user?vacationId=${vacationToUpdate._id}&date=${format(
            new Date(vacationToUpdate.lastWorkDate),
            "MM/dd/yyyy"
          )}-${format(
            new Date(vacationToUpdate.returnToWorkDate),
            "MM/dd/yyyy"
          )}&intent=vacation-rejected`
        );
        // user.recentReceivedVacRejected.push(
        //   `/user?vacationId=${vacationToUpdate._id}&date=${format(
        //     new Date(vacationToUpdate.lastWorkDate),
        //     "MM/dd/yyyy"
        //   )}-${format(
        //     new Date(vacationToUpdate.returnToWorkDate),
        //     "MM/dd/yyyy"
        //   )}&intent=vacation-rejected`
        // );

        vacationToUpdate.status = "rejected";
        vacationToUpdate.approved = false;
        await vacationToUpdate.save();
        // await user.save();
        channel.publish(
          `/user?vacationId=${vacationToUpdate._id}&date=${format(
            new Date(vacationToUpdate.lastWorkDate),
            "MM/dd/yyyy"
          )}-${format(
            new Date(vacationToUpdate.returnToWorkDate),
            "MM/dd/yyyy"
          )}&intent=vacation-rejected`,
          `vacation-rejected-notification${vacationToUpdate.user}`
        );
      } else {
        vacationToUpdate.status = "pending";
        vacationToUpdate.approved = false;
        await vacationToUpdate.save();
      }
      await user.save();
    }
    console.log(vacationToUpdate);
    res.status(200).json(vacationToUpdate);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const deleteVacation = async (req, res) => {
  console.log("Hit the deleteVacation route");

  const { vacationId } = req.params;
  console.log(vacationId);
  if (!mongoose.Types.ObjectId.isValid(vacationId)) {
    return res.status(404).json({ error: "No such vacation" });
  }

  try {
    const deletedVacation = await Vacation.findByIdAndDelete(
      vacationId
    ).populate("user");
    console.log(deletedVacation);

    const user = await User.findByIdAndUpdate(
      deletedVacation.user,
      {
        $pull: { vacationRequests: deletedVacation._id },
      },
      { new: true }
    );

    // const totalNonRejectedVacationsDays =
    //   user.vacationRequests.length > 0
    //     ? user.vacationRequests.reduce((acc, cur) => {
    //         return (
    //           acc +
    //           differenceInBusinessDays(cur.returnToWorkDate, cur.lastWorkDate)
    //         );
    //       }, 0)
    //     : 0;
    // console.log("totalNonRejectedVacationsDays", totalNonRejectedVacationsDays);
    // user.remainingVacationDays =
    //   user.vacationAllocation - totalNonRejectedVacationsDays;
    user.vacStatChange = true;
    await user.save();

    if (deletedVacation.projects.length > 0) {
      for (const project of deletedVacation.projects) {
        await Project.updateOne(
          { _id: project },
          { $pull: { vacationRequests: deletedVacation._id } }
        );
      }
    }

    for (const projId of deletedVacation.projects) {
      const project = await Project.findById(projId).populate("owner");
      project.owner.recievedNotifications.push(
        `/user?vacationId=${deletedVacation._id}&date=${format(
          new Date(deletedVacation.lastWorkDate),
          "MM/dd/yyyy"
        )}-${format(
          new Date(deletedVacation.returnToWorkDate),
          "MM/dd/yyyy"
        )}&intent=vacation-deleted&user=${deletedVacation.user.email}`
      );
      // project.owner.recentReceivedVacDeleted.push(
      //   `/user?vacationId=${deletedVacation._id}&date=${format(
      //     new Date(deletedVacation.lastWorkDate),
      //     "MM/dd/yyyy"
      //   )}-${format(
      //     new Date(deletedVacation.returnToWorkDate),
      //     "MM/dd/yyyy"
      //   )}&intent=vacation-deleted&user=${deletedVacation.user.email}`
      // );
      await project.owner.save();
      channel.publish(
        `/user?vacationId=${deletedVacation._id}&date=${format(
          new Date(deletedVacation.lastWorkDate),
          "MM/dd/yyyy"
        )}-${format(
          new Date(deletedVacation.returnToWorkDate),
          "MM/dd/yyyy"
        )}&intent=vacation-deleted&user=${deletedVacation.user.email}`,
        `vacation-deleted-notification${project.owner._id}`
      );
    }
    res.status(200).json(deletedVacation);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports = {
  createVacation,
  updateVacation,
  deleteVacation,
};
