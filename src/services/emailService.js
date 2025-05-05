const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = {
  async send({ to, subject, html }) {
    await transporter.sendMail({
      from: '"Taking Care" <no-reply@takingcare.com>',
      to,
      subject,
      html
    });
  }
};
