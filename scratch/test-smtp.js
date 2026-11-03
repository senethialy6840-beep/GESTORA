const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env' });

async function main() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log("SMTP connection verified successfully.");
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to self
      subject: "Test Email from NextJS app",
      text: "If you get this, SMTP works."
    });
    console.log("Test email sent!", info.messageId);
  } catch (err) {
    console.error("SMTP Error:", err);
  }
}

main();
