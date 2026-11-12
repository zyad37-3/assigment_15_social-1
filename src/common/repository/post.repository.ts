import { PostModel } from "../../db/model";
import { IPost } from "../interface/post.interface";
import { DataBaseRepository } from "./base.repository";



export class PostRepository extends DataBaseRepository<IPost> {
    constructor() {
        super(PostModel)
    }
} 
