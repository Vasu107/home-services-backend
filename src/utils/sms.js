import twilio from "twilio";
import { env } from "../config/env.js";

/**
 * Format a phone number to E.164 format for India (+91XXXXXXXXXX).
 * If the number already starts with '+', it is returned as-is.
 */
function formatPhone(phone) {
  if (!phone) return null;
  const cleaned = phone.replace(/\s+/g, "").replace(/-/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  // Default to India country code
  return `+91${cleaned.replace(/^0+/, "")}`;
}

/**
 * Send an SMS message to a phone number.
 * Fails gracefully — logs the error but does NOT throw,
 * so booking operations are never disrupted by an SMS failure.
 *
 * @param {string} to   - Recipient phone number (raw from DB, e.g. "9876543210")
 * @param {string} body - Message text (max ~160 chars for 1 SMS segment)
 * @returns {Promise<void>}
 */
export async function sendSms(to, body) {
  const sid   = env.TWILIO_ACCOUNT_SID;
  const token = env.TWILIO_AUTH_TOKEN;
  const from  = env.TWILIO_PHONE_NUMBER;

  if (!sid || !token || !from) {
    console.warn("[SMS] Twilio credentials not configured — skipping SMS.");
    return;
  }

  const formattedTo = formatPhone(to);
  if (!formattedTo) {
    console.warn("[SMS] Recipient phone number is missing — skipping SMS.");
    return;
  }

  try {
    const client = twilio(sid, token);
    const message = await client.messages.create({
      body,
      from,
      to: formattedTo,
    });
    console.log(`[SMS] Sent to ${formattedTo} — SID: ${message.sid}`);
  } catch (err) {
    console.error(`[SMS] Failed to send SMS to ${formattedTo}:`, err.message);
  }
}
