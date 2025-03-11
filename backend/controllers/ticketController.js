const Ticket = require("../models/Ticket");
const Counter = require("../models/Counter");
const User = require("../models/User");

const { channel } = require("../routes/v1/sse");

const path = require("path");

require("dotenv").config();
const cloudinary = require("cloudinary").v2;
// console.log("cloudinary", cloudinary.config().cloud_name);

// util
const { removeAllFilesAsync } = require("../util");

const createTicket = async (req, res) => {
  console.log("hit createTicket route");
  const user = req.user;
  // console.log("user", user);
  console.log("req.body", req.body);
  const { type, importance, content } = req.body;
  console.log("content", content);
  try {
    const counter = await Counter.findOneAndUpdate(
      {},
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );
    if (!counter) {
      throw Error("Unexpected: No counter document found or created.");
    }
    const ticket = await Ticket.create({
      ...req.body,
      user: user._id,
      // type,
      ticketNumber: counter.count,
      // importance,
      // content,
    });
    if (req.files) {
      if (req.files.uploaded_images) {
        const imagePaths = req.files.uploaded_images.map((image) => {
          return {
            url: image.path,
            originalname: image.originalname,
          };
        });
        for (const image of imagePaths) {
          const result = await cloudinary.uploader.upload(image.url, {
            folder: "Projects/images",
          });
          console.log(result);
          ticket.images.push({
            url: result.secure_url,
            asset_id: result.asset_id,
            originalname: image.originalname,
          });
        }
      }
      if (req.files.uploaded_videos) {
        const videoPaths = req.files.uploaded_videos.map((video) => {
          return {
            url: video.path,
            originalname: video.originalname,
          };
        });
        for (const video of videoPaths) {
          const result = await cloudinary.uploader.upload(video.url, {
            folder: "Projects/videos",
            resource_type: "video",
          });
          console.log(result);
          ticket.videos.push({
            url: result.secure_url,
            asset_id: result.asset_id,
            originalname: video.originalname,
          });
        }
      }
      await ticket.save();
      console.log("ticket", ticket);

      // delete temp attachment files
      const dirPath = path.join(__dirname, "../public/temp");
      console.log("dirPath", dirPath);
      await removeAllFilesAsync(dirPath);
      // .then(() => console.log("All files have been removed asynchronously."))
      // .catch(console.error);
    }
    // distribute notification to globalAdmin:
    const globalAdmin = await User.findOne({ isGlobalAdmin: true });
    if (!globalAdmin) {
      throw Error("something went wrong finding global admin");
    }
    globalAdmin.recievedNotifications.push(
      `/tickets?ticketId=${ticket._id}&user=${req.user.email}&intent=new-ticket`
    );
    await globalAdmin.save();
    channel.publish(
      `/tickets?ticketId=${ticket._id}&user=${req.user.email}&intent=new-ticket`,
      `new-ticket-notification${globalAdmin._id}`
    );
    return res.status(200).json(ticket);
  } catch (error) {
    console.log(error.message);
  }
};

const getTickets = async (req, res) => {
  console.log("hit getTickets route");
  const { isGlobalAdmin, _id: userId } = req.user;

  try {
    let tickets;
    if (isGlobalAdmin) {
      tickets = await Ticket.find().populate(["replies", "user"]);
    } else {
      tickets = await Ticket.find({ user: userId }).populate([
        "replies",
        "user",
      ]);
    }
    if (!tickets) {
      throw Error("something went wrong retrieving your tickets");
    }
    console.log("tickets", tickets);
    res.status(200).json(tickets);
  } catch (error) {
    s;
    res.status(404).json({ error: error.message });
  }
};

const updateTicket = async (req, res) => {
  console.log("hit updateTicket route");
  const { ticketId } = req.params;
  const { status } = req.body;

  try {
    const globalAdmins = await User.find({ isGlobalAdmin: true });
    if (!globalAdmins) {
      throw Error("something went wrong finding you global admins");
    }
    const updatedTicket = await Ticket.findOneAndUpdate(
      { _id: ticketId },
      { status },
      { returnDocument: "after" }
    );
    if (!updatedTicket) {
      throw Error("problem updating ticket");
    }
    // distribute notification to ticket.user about update
    for (const distribUser of [
      updatedTicket.user,
      ...globalAdmins.map((ga) => ga._id),
    ]) {
      const distribUserObj = await User.findById(distribUser);
      distribUserObj.recievedNotifications.push(
        `/tickets?ticketId=${updatedTicket._id}&user=jamesDineley&intent=update-ticket`
      );
      await distribUserObj.save();
      channel.publish(
        `/tickets?ticketId=${updatedTicket._id}&user=jamesDineley&intent=update-ticket`,
        `ticket-update-notification${distribUserObj._id}`
      );
    }
    res.status(200).json(updatedTicket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createTicket,
  getTickets,
  updateTicket,
};
