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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalValidationFields = void 0;
const z = __importStar(require("zod"));
const user_enum_js_1 = require("./enum/user.enum.js");
const security_tokenTypeEnum_js_1 = require("./enum/security.tokenTypeEnum.js");
const mongoose_1 = __importDefault(require("mongoose"));
const validationMessage = {
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
function getValidationMessage({ lang, code }) {
    return lang === security_tokenTypeEnum_js_1.LangEnum.EN ? validationMessage[code].en : validationMessage[code].ar;
}
exports.generalValidationFields = {
    email: (lang) => z.email({
        message: getValidationMessage({
            lang,
            code: 2,
        }),
    }),
    password: (lang) => z.string()
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
    userName: (lang) => z.string()
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
    phone: (lang) => z.e164({
        message: getValidationMessage({
            lang,
            code: 7,
        }),
    }),
    confirmpassword: (lang) => z.string().min(2, {
        message: getValidationMessage({
            lang,
            code: 8,
        }),
    }),
    role: (lang) => z.enum(user_enum_js_1.roleEnum, {
        message: getValidationMessage({
            lang,
            code: 9,
        }),
    }),
    otp: (lang) => z.string().regex(/^\d{6}$/, {
        message: getValidationMessage({
            lang,
            code: 10
        })
    }),
    id: (lang) => z.string().refine((data) => mongoose_1.default.Types.ObjectId.isValid(data), { message: "Invalid format" }),
    file: (lang) => z.strictObject({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.string(),
        buffer: z.instanceof(Buffer),
        size: z.number(),
        path: z.string()
    })
};
