import {z} from "zod";
import { createPost, updatePost } from "../post.validation";
export type CreateDto = z.infer<ReturnType<typeof createPost>>["body"]     
export type updateDto = z.infer<ReturnType<typeof updatePost>>["body"]     