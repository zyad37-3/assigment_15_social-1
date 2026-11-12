// import mongoose from "mongoose";
import { IUser } from "../../common/interface/user.interface.js";
import { AccountStatusEnum, genderEnum, roleEnum } from "../../common/enum/user.enum.js";
import mongoose, { HydratedDocument } from 'mongoose';
import { hash } from "../../common/security/hash.security.js";
import { decrypt, encrypt } from "../../common/security/encryption,security.js";
import { number } from "zod";
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
    },
    changeStatusAt: Date,
    status: { type: Number, enum: AccountStatusEnum, default: AccountStatusEnum.ACTIVE }
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


userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await hash(this.password)
    }
    if (this.isModified("phone")) {
        this.phone = await encrypt(this.phone as string)
    }
})
//ARCHIVE بيخفي المستخدمين اللي حالتهم 

userSchema.pre(["find", "findOne", "countDocuments"], function () {
    const query = this.getFilter()
    if (query.paranoid != false) this.setQuery({ ...query, status: { $ne: AccountStatusEnum.ARCHIVE } })
})
userSchema.pre(["updateOne", "updateMany", "findOneAndUpdate"], function () {
    const query = this.getFilter()
    const update = this.getUpdate() as HUser
    console.log({ query, update });

    if (update.status == AccountStatusEnum.ACTIVE) {
        this.setQuery({ ...query, status: { $eq: AccountStatusEnum.ARCHIVE } })
    } else if (update.status == AccountStatusEnum.ARCHIVE) {
        this.setQuery({ ...query, status: { $ne: AccountStatusEnum.ARCHIVE } })
    }
    if (!update.status && query.paranoid != false) {
        this.setQuery({ ...query, status: { $ne: AccountStatusEnum.ARCHIVE } })
    }
    this.setUpdate({
        ...this.getUpdate(),
        ...(update.status ? { changeStatusAt: new Date() } : {})
    })


})

userSchema.pre(["deleteOne", "deleteMany", "findOneAndDelete"], function () {
    const query = this.getFilter()
    if (!query.force) {
        this.setQuery({ ...query, status: { $eq: AccountStatusEnum.ARCHIVE } })
    }
})
userSchema.pre("insertMany", function (docs: HUser[]) {
    console.log({ this: this });

})

export const UserModel = mongoose.models.User || mongoose.model<IUser>("User", userSchema)
export type HUser = HydratedDocument<IUser>