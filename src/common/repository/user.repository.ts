import { AnyKeys, Model, CreateOptions } from "mongoose";
import { DataBaseRepository } from "./base.repository";
import { UserModel } from "../../db/model";
import { IUser } from "../interface";

export class UserRepository extends DataBaseRepository<IUser> {
    constructor() {
        super(UserModel)
    }
} 