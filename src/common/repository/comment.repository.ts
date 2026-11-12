import { commentModel } from "../../db/model";
import { IComment } from "../interface";
import { DataBaseRepository } from "./base.repository";



export class commentRepository extends DataBaseRepository<IComment> {
    constructor() {
        super(commentModel)
    }
} 
