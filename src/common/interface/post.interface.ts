import { Types } from "mongoose";

export interface IPost {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    attachment: string[];
    content?: string;
    createdAt?: Date;
    updatedAt?: Date;

}