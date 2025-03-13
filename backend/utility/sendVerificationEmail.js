const nodemailer = require("nodemailer");

const sendVerificationEmail = async (to, url) => {
  console.log("in sendVerificationEmail util function");
  // const transporter = nodemailer.createTransport({
  //   host: "smtp.ethereal.email",
  //   port: 587,
  //   secure: false,
  //   auth: {
  //     user: "bettie.little24@ethereal.email",
  //     pass: "ZCUpeVqDgvAHyTRWzv",
  //   },
  // });
  let transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 465, // or 465 for SSL
    secure: true, // true for port 465, false for other ports
    auth: {
      user: "noreply@projects-web.io", // your email address
      pass: process.env.PRIVATE_EMAIL_PW, // the app-specific password
    },
  });
  // const transporter = nodemailer.createTransport({
  //   service: "Gmail",
  //   host: "smtp.gmail.com",
  //   port: 465,
  //   secure: true,
  //   auth: {
  //     user: "jdineley@gmail.com",
  //     pass: "xkvt tnxi wlev ixym",
  //   },
  // });
  try {
    const info = await transporter.sendMail({
      from: `noreply@projects-web.io`,
      to,
      subject: "Verify your email address",
      html: `<h2>Welcome to Projects!</h2>
             <p>Please verify your email by clicking the link below:</p>
             <a href="${url}">Click to Verify your email</a>`,
    });
  } catch (error) {
    console.log("sendVerificationEmailError:", error);
    throw Error(error);
  }
};

module.exports = sendVerificationEmail;
