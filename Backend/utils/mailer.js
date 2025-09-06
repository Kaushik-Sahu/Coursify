const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // Use `true` for port 465, `false` for all other ports (like 587)
    auth: {
        user: process.env.SMTP_USER, // SMTP username
        pass: process.env.SMTP_PASS  // SMTP password
    }
});

 // Sends an email using the pre-configured transporter.

const sendMail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject,
            html
        });
    } catch (error) {
        console.error("Error sending email:", error);
        // Re-throwing the error to be handled by the calling function
        throw error;
    }
};

module.exports = sendMail;