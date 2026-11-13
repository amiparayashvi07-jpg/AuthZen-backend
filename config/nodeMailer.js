import nodemailer from "nodemailer";

// Fallback SMTP transporter (works on localhost or hosts where port 587/465 is open)
const smtpTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_KEY,
  },
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 8000,
});

// Brevo REST API over HTTPS port 443 (Allowed by Render Free Tier without restrictions)
const sendViaBrevoApi = async ({ from, to, subject, text, html }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error(
      "BREVO_API_KEY is missing. Render Free Tier blocks SMTP port 587, so you must use Brevo's HTTP API Key (xkeysib-...)."
    );
  }

  const senderEmail = from || process.env.SENDER_EMAIL;
  const payload = {
    sender: {
      name: "Authentication App",
      email: senderEmail,
    },
    to: [{ email: to }],
    subject,
    ...(html ? { htmlContent: html } : {}),
    ...(text ? { textContent: text } : {}),
  };

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data.message || `Failed to send email via Brevo API (${response.status})`
    );
  }

  return { messageId: data.messageId };
};

export const transporter = {
  sendMail: async (options) => {
    // If BREVO_API_KEY is defined, use the HTTPS REST API (essential for Render free tier)
    if (process.env.BREVO_API_KEY) {
      return await sendViaBrevoApi(options);
    }
    // Otherwise fallback to SMTP (local dev or paid servers)
    return await smtpTransporter.sendMail(options);
  },
};

export const sendemail = async ({ email, subject, text }) => {
  try {
    let info = await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: subject,
      text: text,
    });
    console.log("Mail sent", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
