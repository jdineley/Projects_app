const sendVerificationEmail = async (to, url) => {
  console.log("in sendVerificationEmail util function");
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: "bettie.little24@ethereal.email",
      pass: "ZCUpeVqDgvAHyTRWzv",
    },
  });
  try {
    const info = await transporter.sendMail({
      from: `<no-reply>`,
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
