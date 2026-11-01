import * as z from "zod"
import { LangEnum } from "../../common/enum"
import { generalValidationFields } from "../../common/utils/validation.js"
export const login = (lang:LangEnum) => {
    return z.strictObject({
        email: generalValidationFields.email(lang),
        password: generalValidationFields.password(lang)
    })
}
export const loginSchema = (lang:LangEnum) => {
    return z.object({
        body: login(lang),

    })
}

export const signupSchema = (lang:LangEnum) => {
    return z.object({
        body: login(lang).safeExtend({
            userName: generalValidationFields.userName(lang),
            phone: generalValidationFields.phone(lang),
            confirmpassword: generalValidationFields.password(lang).optional(),
            role: generalValidationFields.role(lang).optional()
        }).refine((value) => value.password === value.confirmpassword, {
            error: lang === LangEnum.EN ? "Passwords don't match" : "كلمتا المرور غير متطابقتين"
            ,
            path: ["confirmpassword"],
        })
    })
}
export const confirmEmailSchema = (lang:LangEnum) => {
    return z.object({
        body: z.strictObject({
            email: generalValidationFields.email(lang),
            otp: generalValidationFields.otp(lang)
        }),

    })
}
export const resendConfirmEmailSchema = (lang:LangEnum) => {
    return z.object({
        body: z.strictObject({
            email: generalValidationFields.email(lang),
        }),

    })
}
export const resetForgotPasswordSchema = (lang:LangEnum) => {
    return z.object({
        body: z.strictObject({
            email: generalValidationFields.email(lang),
            otp: generalValidationFields.otp(lang),
            password: generalValidationFields.password(lang),
            confirmpassword: generalValidationFields.password(lang),
        }).refine((value) => value.password === value.confirmpassword, {
            error: lang === LangEnum.EN ? "Passwords don't match" : "كلمتا المرور غير متطابقتين"
            ,
            path: ["confirmpassword"],
        })

    })
}
