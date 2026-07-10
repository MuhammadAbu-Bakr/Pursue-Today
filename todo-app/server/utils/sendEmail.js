const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false, 
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendVerificationEmail(to, rawToken) {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}`;

  if (!process.env.MAIL_HOST) {
    console.log(`\n========================================`);
    console.log(`Development: Verification Email Intercepted`);
    console.log(`To: ${to}`);
    console.log(`Verify URL: ${verifyUrl}`);
    console.log(`========================================\n`);
    return;
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: "Verify your email",
    html: `
      <p>Welcome! Please verify your email address to activate your account.</p>
      <p><a href="${verifyUrl}">Click here to verify your email</a></p>
      <p>This link expires in 24 hours. If you didn't sign up, you can ignore this email.</p>
    `,
  });
}

module.exports = { sendVerificationEmail };
