const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'misopetrik@gmail.com',
    subject: 'Welcome',
    text: `Welcome to the app, ${name}. Let me know how you get alogn with the app.`,
  });
};

const sendGoodbyeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'misopetrik@gmail.com',
    subject: 'Goodbye',
    text: 'Goodbye, we will miss you...',
  });
};

module.exports = {
  sendWelcomeEmail,
  sendGoodbyeEmail,
};
