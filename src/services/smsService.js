const twilio = require('twilio')(
  process.env.TWILIO_SID,
  process.env.TWILIO_TOKEN
);

module.exports = {
  async send({ phone, message }) {
    await twilio.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: phone
    });
  }
};
