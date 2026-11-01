import { EventEmitter } from "node:events"
import { EmailSubjectEnum } from "../../enum"
import { sendEmil } from "./send.email"
import { verifyEmailTemplate } from "./email.templates"

export const emailEvent = new EventEmitter()
emailEvent.on("sendEmail", async ({
    recipients,
    subject=EmailSubjectEnum.CONFIRM_EMAIL,
    data
}: {
    subject: EmailSubjectEnum,
    recipients: { to?: string[], cc?: string[], dcc?: string[] },
    data: any
}) => {
    try {
        await sendEmil({
            ...recipients,
            subject,
            html: verifyEmailTemplate({ code: data.code, subject, title: data.title })
        })

    } catch (error) {
        console.log(error);

    }
})