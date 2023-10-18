const mailer = require('nodemailer');

const welcome = require('./welcome');
const goodbye = require('./goodbye');

const sendEmail = (from, to, type) => {
  const transporter = mailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.GOOGLE_EMAIL_ID,
      pass: process.env.GOOGLE_EMAIL_PASSWORD,
    },
  });

  const getEmailData = (from, to, type) => {
    let data = null;

    switch (type) {
      case 'welcome':
        data = {
          from,
          to,
          subject: `Welcome ${to}!`,
          html: welcome(),
        };
        break;
      case 'goodbye':
        data = {
          from,
          to,
          subject: `Goodbye ${to}!`,
          html: goodbye(),
        };
        break;
      default:
        data = null;
    }
    return data;
  };

  const mail = getEmailData(from, to, type);

  transporter.sendMail(mail, (error, response) => {
    if (error) {
      console.error(error);
    } else {
      console.log('success');
    }
    transporter.close();
  });
};

module.exports = sendEmail;
