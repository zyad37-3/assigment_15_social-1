import { genderEnum, roleEnum } from "../enum"

export interface IUser {
    firstName: string;
    lastName: string;
    userName?: string;
    email: string;
    password: string;
    gender: genderEnum;
    role: roleEnum;
    phone?: string;
    DOB?: string;
    confirmEmail?: string;
    image?: string;
    coverImage?: string[];
    changeCredentialsTime?: string
    createdAt?: string
    updatedAt?: string

}