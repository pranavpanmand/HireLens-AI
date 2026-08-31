"use strict";
const nodemailer = require("nodemailer");

let transporter;

async function createTransporter() {
    if (transporter) return transporter;
    
    // For development, we'll use Ethereal Email if no SMTP credentials are provided
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT == 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    } else {
        // Fallback for local testing
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
        console.log("Using Ethereal Email for development. Check console logs for email previews.");
    }
    return transporter;
}

const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const mailTransporter = await createTransporter();
        const info = await mailTransporter.sendMail({
            from: '"Career Compass AI" <noreply@careercompassai.com>',
            to,
            subject,
            text,
            html
        });
        
        console.log(`Email sent to ${to}: ${info.messageId}`);
        if (info.messageId && !process.env.SMTP_HOST) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
        return info;
    } catch (error) {
        console.error("Email sending failed:", error);
        throw error;
    }
};

exports.sendEmail = sendEmail;
