import { NextFunction, Request, Response } from "express"
import { LangEnum } from "../common/enum"
import { BadRequestException } from "../common/expiation"
import { ZodType } from "zod"


//schemaType بتظتط 
type ValidationSchemaType = (lang: LangEnum) => ZodType

export const validation = (schema: ValidationSchemaType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const lang = Number(req.headers['lang']) || LangEnum.EN

        
        const validation = schema(lang).safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
            files: req.files
        })


        if (!validation.success) {
            throw new BadRequestException("validation error", { issues: validation.error.issues })
        }
       req.validate = validation.data
        next()

    }
}