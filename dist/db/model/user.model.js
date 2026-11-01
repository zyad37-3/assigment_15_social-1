"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const user_enum_js_1 = require("../../common/enum/user.enum.js");
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    firstName: {
        type: String,
        minlength: 2,
        maxlength: 20,
        required: true
    },
    lastName: {
        type: String,
        minlength: 2,
        maxlength: 20,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: String,
    DOB: String,
    confirmEmail: Date,
    image: String,
    coverImage: [String],
    gender: {
        type: Number,
        enum: user_enum_js_1.genderEnum,
        default: user_enum_js_1.genderEnum.MALE
    },
    role: {
        type: Number,
        enum: user_enum_js_1.roleEnum,
        default: user_enum_js_1.roleEnum.USER
    },
    changeCredentialsTime: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});
userSchema.virtual("userName").set(function (value) {
    const [firstName, lastName] = value.split(" ");
    this.set({ firstName, lastName });
}).get(function () {
    return `${this.firstName} ${this.lastName}`;
});
exports.UserModel = mongoose_1.default.models.User || mongoose_1.default.model("User", userSchema);
