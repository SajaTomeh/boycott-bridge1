//backend/src/utils/sendEmail.js

import nodemailer from 'nodemailer';

const sendEmail = async (userEmail, subject, htmlTemplate) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.APP_EMAIL_ADDRESS,
                pass: process.env.APP_EMAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false // don't fail on unauthorized certs
            }
        });

        const mailOptions = {
            from: process.env.APP_EMAIL_ADDRESS,
            to: userEmail,
            subject: subject,
            html: htmlTemplate,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email Sent: " + info.response);
    } catch (error) {
        console.log(error);
        throw new Error("Internal Server Error (nodemailer)");
    }
};

export default sendEmail;
