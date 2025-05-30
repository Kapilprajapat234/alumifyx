const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Nodemailer configuration error:', error.message);
    process.exit(1);
  } else {
    console.log('Nodemailer is ready to send emails');
  }
});

module.exports = transporter; 