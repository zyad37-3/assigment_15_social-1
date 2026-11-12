"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const user_enum_js_1 = require("../../common/enum/user.enum.js");
const mongoose_1 = __importDefault(require("mongoose"));
const hash_security_js_1 = require("../../common/security/hash.security.js");
const encryption_security_js_1 = require("../../common/security/encryption,security.js");
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
    },
    changeStatusAt: Date,
    status: { type: Number, enum: user_enum_js_1.AccountStatusEnum, default: user_enum_js_1.AccountStatusEnum.ACTIVE }
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
userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await (0, hash_security_js_1.hash)(this.password);
    }
    if (this.isModified("phone")) {
        this.phone = await (0, encryption_security_js_1.encrypt)(this.phone);
    }
});
userSchema.pre(["find", "findOne", "countDocuments"], function () {
    const query = this.getFilter();
    if (query.paranoid != false)
        this.setQuery({ ...query, status: { $ne: user_enum_js_1.AccountStatusEnum.ARCHIVE } });
});
userSchema.pre(["updateOne", "updateMany", "findOneAndUpdate"], function () {
    const query = this.getFilter();
    const update = this.getUpdate();
    console.log({ query, update });
    if (update.status == user_enum_js_1.AccountStatusEnum.ACTIVE) {
        this.setQuery({ ...query, status: { $eq: user_enum_js_1.AccountStatusEnum.ARCHIVE } });
    }
    else if (update.status == user_enum_js_1.AccountStatusEnum.ARCHIVE) {
        this.setQuery({ ...query, status: { $ne: user_enum_js_1.AccountStatusEnum.ARCHIVE } });
    }
    if (!update.status && query.paranoid != false) {
        this.setQuery({ ...query, status: { $ne: user_enum_js_1.AccountStatusEnum.ARCHIVE } });
    }
    this.setUpdate({
        ...this.getUpdate(),
        ...(update.status ? { changeStatusAt: new Date() } : {})
    });
});
userSchema.pre(["deleteOne", "deleteMany", "findOneAndDelete"], function () {
    const query = this.getFilter();
    if (!query.force) {
        this.setQuery({ ...query, status: { $eq: user_enum_js_1.AccountStatusEnum.ARCHIVE } });
    }
});
userSchema.pre("insertMany", function (docs) {
    console.log({ this: this });
});
exports.UserModel = mongoose_1.default.models.User || mongoose_1.default.model("User", userSchema);
