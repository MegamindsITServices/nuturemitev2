import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  // Use your .env for credentials
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  console.log(process.env.SMTP_FROM, process.env.SMTP_USER, process.env.SMTP_HOST, process.env.SMTP_PORT, process.env.SMTP_SECURE);
  

  console.log(`Sending email to: ${to}, Subject: ${subject}`);
  

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"Nuturemite" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};
