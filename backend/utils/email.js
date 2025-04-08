const brevo = require("@getbrevo/brevo");
require("dotenv").config();

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Initialize Brevo API client
    const apiInstance = new brevo.TransactionalEmailsApi();

    // Configure API key authentication
    const apiKey = apiInstance.authentications["apiKey"];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    // Prepare email content
    const sender = {
      email: process.env.EMAIL_FROM,
      name: "MMU Voting System",
    };

    const receivers = [{ email: to }];

    const email = {
      sender,
      to: receivers,
      subject,
      htmlContent: html,
      textContent: text,
    };

    // Send email
    await apiInstance.sendTransacEmail(email);
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("Brevo API error:", error.response?.body || error.message);
    return false;
  }
};

module.exports = sendEmail;
