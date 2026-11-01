// export interface ISighup {
//     userName: string;
//     email: string;
//     password: string;
//     phone: string;
// }
import {z} from "zod";
import { confirmEmailSchema, resendConfirmEmailSchema, signupSchema } from "../authentication.validation";
export type SighupDto = z.infer<ReturnType<typeof signupSchema>>    
export type ConfirmEmailDto = z.infer<ReturnType<typeof confirmEmailSchema>>["body"]    
export type ResendConfirmEmailDto = z.infer<ReturnType<typeof resendConfirmEmailSchema>>["body"]   