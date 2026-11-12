import * as z from "zod"
import { LangEnum } from "../../common/enum"
import { generalValidationFields } from "../../common/utils/validation.js"


export const createComment = (lang: LangEnum) => {
    return z.object({
        body: z.strictObject({
            content: z.string().trim().min(2).max(50000).optional(),
            postId: generalValidationFields.id(lang),
        }),
        files: z.array(
            generalValidationFields.file(lang)).max(5).optional()
    }).superRefine((data, ctx) => {


        if (!data.body.content && !data.files?.length) {
            ctx.addIssue({
                code: 'custom',
                path: ['body', 'content'],
                message: 'missing message content'
            })
        }
    })
}
export const updateComment = (lang: LangEnum) => {
    return z.object({
        body: z.strictObject({
            content: z.string().trim().min(2).max(50000).optional(),


        }),
        files: z.array(
            generalValidationFields.file(lang)).max(5).optional()
    }).superRefine((data, ctx) => {
        if (data.body.content === undefined && !data.files?.length) {
            ctx.addIssue({
                code: "custom",
                path: ["body", "content"],
                message: "Nothing to update"
            })
        }
    })
}



