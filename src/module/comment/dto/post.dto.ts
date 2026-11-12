import {z} from "zod";
import {  createComment, updateComment } from "../comment.validation";
export type CreateDto = z.infer<ReturnType<typeof createComment>>["body"]     
export type updateDto = z.infer<ReturnType<typeof updateComment>>["body"]     