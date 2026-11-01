
import * as z from "zod";
import { roleEnum } from "../enum/user.enum.js";
import { LangEnum } from "../enum/security.tokenTypeEnum.js";
import mongoose from "mongoose";

const validationMessage :any = {
    1: {
        ar: "عفواً، يجب أن تكون هناك مسافة بين الكلمات",
        en: "Please include a space between the words",
    },

    2: {
        ar: "البريد الإلكتروني غير صحيح",
        en: "Please enter a valid email address",
    },

    3: {
        ar: "كلمة المرور يجب أن تكون حرفين على الأقل",
        en: "Password must be at least 2 characters",
    },

    4: {
        ar: "كلمة المرور يجب ألا تتجاوز 20 حرفاً",
        en: "Password must not exceed 20 characters",
    },

    5: {
        ar: "اسم المستخدم يجب أن يكون حرفين على الأقل",
        en: "Username must be at least 2 characters",
    },

    6: {
        ar: "اسم المستخدم يجب ألا يتجاوز 25 حرفاً",
        en: "Username must not exceed 25 characters",
    },

    7: {
        ar: "رقم الهاتف غير صحيح",
        en: "Please enter a valid phone number",
    },

    8: {
        ar: "من فضلك قم بتأكيد كلمة المرور",
        en: "Please confirm your password",
    },

    9: {
        ar: "الصلاحية المحددة غير صحيحة",
        en: "Please select a valid role",
    },
    10: {
        ar: "يتكون من 6 ارقام otp لازم يكون ",
        en: "you should otp is 6 number",
    },
};

function getValidationMessage({ lang, code }:{ lang?:LangEnum, code:number }) {
    return lang === LangEnum.EN ? validationMessage[code].en : validationMessage[code].ar;
}

export const generalValidationFields = {
    email: (lang:LangEnum) =>
        z.email({
            message: getValidationMessage({
                lang,
                code: 2,
            }),
        }),

    password: (lang:LangEnum) =>
        z.string()
            .min(2, {
                message: getValidationMessage({
                    lang,
                    code: 3,
                }),
            })
            .max(20, {
                message: getValidationMessage({
                    lang,
                    code: 4,
                }),
            }),

    userName: (lang:LangEnum) =>
        z.string()
            .min(2, {
                message: getValidationMessage({
                    lang,
                    code: 5,
                }),
            })
            .max(25, {
                message: getValidationMessage({
                    lang,
                    code: 6,
                }),
            })
            .includes(" ", {
                message: getValidationMessage({
                    lang,
                    code: 1,
                }),
            }),

    phone: (lang:LangEnum) =>
        z.e164({
            message: getValidationMessage({
                lang,
                code: 7,
            }),
        }),

    confirmpassword: (lang:LangEnum) =>
        z.string().min(2, {
            message: getValidationMessage({
                lang,
                code: 8,
            }),
        }),

    role: (lang:LangEnum) =>
        z.enum(roleEnum, {
            message: getValidationMessage({
                lang,
                code: 9,
            }),
        }),
    otp: (lang:LangEnum) =>
        z.string().regex(/^\d{6}$/, {
            message: getValidationMessage({
                lang,
                code: 10
            })
        }),
    id: (lang:LangEnum) => z.string().refine((data) => mongoose.Types.ObjectId.isValid(data), { message: "Invalid format" }),
    file: (lang:LangEnum) => z.strictObject({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.string(),
        buffer: z.instanceof(Buffer),
        size: z.number(),
        path: z.string()

    })
};

