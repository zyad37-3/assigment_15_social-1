"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailEvent = void 0;
const node_events_1 = require("node:events");
const enum_1 = require("../../enum");
const send_email_1 = require("./send.email");
const email_templats_1 = require("./email.templats");
exports.emailEvent = new node_events_1.EventEmitter();
exports.emailEvent.on("sendEmail", async ({ recipients, subject = enum_1.EmailSubjectEnum.CONFIRM_EMAIL, data }) => {
    try {
        await (0, send_email_1.sendEmil)({
            ...recipients,
            subject,
            html: (0, email_templats_1.verifyEmailTemplate)({ code: data.code, subject, title: data.title })
        });
    }
    catch (error) {
        console.log(error);
    }
});
