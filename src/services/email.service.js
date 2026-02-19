const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendReminder = async (email, name) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reminder: Submit Your Tracker",
    html: `<p>Hi ${name},</p>
           <p>You haven't submitted your tracker today.</p>
           <p>Please submit before end of day.</p>`
  });
};
