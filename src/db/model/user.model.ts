// import mongoose from "mongoose";
import { IUser } from "../../common/interface/user.interface.js";
import { genderEnum, roleEnum } from "../../common/enum/user.enum.js";
import mongoose, { HydratedDocument } from 'mongoose';
//genderEnum وحطيت  genderEnum) /خلى بالك انا شلت 

const userSchema = new mongoose.Schema<IUser>({

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
        enum: genderEnum,
        default: genderEnum.MALE
    },
    role: {
        type: Number,
        enum: roleEnum,
        default: roleEnum.USER
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



})

userSchema.virtual("userName").set(function (value) {
    const [firstName, lastName] = value.split(" ")
    this.set({ firstName, lastName })
}).get(function () {
    return `${this.firstName} ${this.lastName}`
})

export const UserModel = mongoose.models.User || mongoose.model<IUser>("User", userSchema)
export type HUser = HydratedDocument<IUser>