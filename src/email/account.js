const API_KEY = process.env.MAILGUN_API_KEY;
const DOMAIN = process.env.MAILGUN_DOMAIN;

const mailgun = require("mailgun-js")
// const mailgun = require("mailgun.js");
const mg = mailgun({ apiKey: API_KEY, domain: DOMAIN });

const sendWelcomeEmail = (email, name) => {
  const data = {
    from: "LifeNeedsApparel <lifeneedsclothing@gmail.com>",
    to: `${email}`,
    subject: "Welcome to LifeNeedsClothing",
    text: `Hello ${name} ! Welcome to our site and happy shopping for quality clothings. `,
    // html: "<h1>Welcome our dear customer</h1>",
  };

  mg.messages().send(data, function (error, body) {
    try {
      console.log(body);
    } catch (e) {
      console.log(error);
    }
  });
};

module.exports = {
  sendWelcomeEmail
};
