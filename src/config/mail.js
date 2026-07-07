import nodemailer from "nodemailer";
import "./env.js";

const transporterConfig = {
  host: process.env.MAIL_HOST ?? "",
  port: Number(process.env.MAIL_PORT ?? 587),
  secure: process.env.MAIL_SECURE === "true",
  auth:
    process.env.MAIL_USER && process.env.MAIL_PASS
      ? {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        }
      : undefined,
};

export const transporter = nodemailer.createTransport(transporterConfig);

export async function sendMail({ to, subject, text, html }) {
  if (!transporterConfig.host || !transporterConfig.auth) {
    console.warn("Mail settings are incomplete; sendMail skipped.");
    return null;
  }

  return transporter.sendMail({
    from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
    to,
    subject,
    text,
    html,
  });
}
