import { APP_EMAIL, APP_PASSWORD, APPLICATION_NAME } from "../../../config.js";

import nodemailer from "nodemailer";
import { EmailSubjectEnum } from "../../enum/email.enum.js";
import { BadRequestException } from "../../expiation/domain.Exception.js";
export const userEmailKey = ({ email, subject }: { email: string, subject: EmailSubjectEnum }): string => {
    return `User::${email}::${subject}::OTP`
}
export const userEmailTrialsKey = ({ email, subject }: { email: string, subject: EmailSubjectEnum }) => {
    return `${userEmailKey({ email, subject })}::Trials`
}
// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',

    auth: {
        user: APP_EMAIL,
        pass: APP_PASSWORD,
    }, tls: {
        rejectUnauthorized: false
    }
});
export const sendEmil = async ({
    to = [],
    cc = [],
    bcc = [],
    subject,
    text = "",
    html = "",
    attachments = []
}: {
    to?: string[],
    cc?: string[],
    bcc?: string[],
    subject: string,
    text?: string,
    html?: string,
    attachments?: any[]
}) => {
    try {
        if (!to.length && !cc.length && !bcc.length) {
            throw new BadRequestException("Macing email recipients")
        }
        if (!text.length && !html.length && !attachments.length) {
            throw new BadRequestException("Macing email content")
        }
        const info = await transporter.sendMail({
            from: `"${APPLICATION_NAME}" <${APP_EMAIL}>`, // sender address
            to,
            cc,
            bcc,
            subject,
            text,
            html,
            attachments,
        });

        console.log("Message sent: %s", info.messageId);
        // Preview URL is only available when using an Ethereal test account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (err) {
        console.error("Error while sending mail:", err);
    }
}
