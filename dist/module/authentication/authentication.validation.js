"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetForgotPasswordSchema = exports.resendConfirmEmailSchema = exports.confirmEmailSchema = exports.signupSchema = exports.loginSchema = exports.login = void 0;
const z = __importStar(require("zod"));
const enum_1 = require("../../common/enum");
const utils_1 = require("../../common/utils");
const login = (lang) => {
    return z.strictObject({
        email: utils_1.generalValidationFields.email(lang),
        password: utils_1.generalValidationFields.password(lang)
    });
};
exports.login = login;
const loginSchema = (lang) => {
    return z.object({
        body: (0, exports.login)(lang),
    });
};
exports.loginSchema = loginSchema;
const signupSchema = (lang) => {
    return z.object({
        body: (0, exports.login)(lang).safeExtend({
            userName: utils_1.generalValidationFields.userName(lang),
            phone: utils_1.generalValidationFields.phone(lang),
            confirmpassword: utils_1.generalValidationFields.password(lang).optional(),
            role: utils_1.generalValidationFields.role(lang).optional()
        }).refine((value) => value.password === value.confirmpassword, {
            error: lang === enum_1.LangEnum.EN ? "Passwords don't match" : "كلمتا المرور غير متطابقتين",
            path: ["confirmpassword"],
        })
    });
};
exports.signupSchema = signupSchema;
const confirmEmailSchema = (lang) => {
    return z.object({
        body: z.strictObject({
            email: utils_1.generalValidationFields.email(lang),
            otp: utils_1.generalValidationFields.otp(lang)
        }),
    });
};
exports.confirmEmailSchema = confirmEmailSchema;
const resendConfirmEmailSchema = (lang) => {
    return z.object({
        body: z.strictObject({
            email: utils_1.generalValidationFields.email(lang),
        }),
    });
};
exports.resendConfirmEmailSchema = resendConfirmEmailSchema;
const resetForgotPasswordSchema = (lang) => {
    return z.object({
        body: z.strictObject({
            email: utils_1.generalValidationFields.email(lang),
            otp: utils_1.generalValidationFields.otp(lang),
            password: utils_1.generalValidationFields.password(lang),
            confirmpassword: utils_1.generalValidationFields.password(lang),
        }).refine((value) => value.password === value.confirmpassword, {
            error: lang === enum_1.LangEnum.EN ? "Passwords don't match" : "كلمتا المرور غير متطابقتين",
            path: ["confirmpassword"],
        })
    });
};
exports.resetForgotPasswordSchema = resetForgotPasswordSchema;
