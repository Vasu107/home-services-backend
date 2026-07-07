import { sendMail } from "../config/mail.js";

export async function mailNotification({ to, subject, text, html }) {
  try {
    return await sendMail({ to, subject, text, html });
  } catch (error) {
    console.warn("Failed to send email notification", error);
    return null;
  }
}
