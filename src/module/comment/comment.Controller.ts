import { NextFunction, Request, Response, Router } from "express";
import { authentication, responseFormatter, uploadMulterUpload, validation } from "../../middleware";
import * as validator from "./comment.validation"
import { fileValidation, localFileUpload } from "../../common/utils/multer";
import { StorageApproachEnum } from "../../common/enum";
import { commentService } from "./comment.Service";
import { IFile } from "../../common/types";
import { IComment, IResponse } from "../../common/interface";

const router = Router({ caseSensitive: true, strict: true });



router.post("/",
    authentication(),
    uploadMulterUpload({
        multerMetalware: localFileUpload({ maxFileSize: 3, storageApproach: StorageApproachEnum.MEMORY }).array("attachment"),
        customPath: "users",
        isRequired: false,
        validation: fileValidation.image
    }),
    validation(validator.createComment),
    responseFormatter(async (req: Request, res: Response, next: NextFunction):Promise<IResponse<IComment>> => {
        console.log({ body :req.validate.body });
         const data = await commentService.createComment(req.validate.body, req.files as IFile[], req.user)
        return {data}
    })
)
router.get("/getPosts/:postId",
    authentication(),
    responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await commentService.getPostAndComment(req.params.postId as string)
     
        return { data: data }
    })
)
router.get("/:commentId",
    authentication(),
    responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await commentService.getCommentById(req.params.commentId as string)
        return { data: data }
    })
)
router.delete("/:commentId",
    authentication(),
    responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await commentService.deleteComment(req.params.commentId as string, req.user)
        return { data: data }
    })
)
router.patch("/:commentId",
    authentication(),
    uploadMulterUpload({
        multerMetalware: localFileUpload({ maxFileSize: 3, storageApproach: StorageApproachEnum.MEMORY }).array("attachment"),
        customPath: "users",
        isRequired: false,
        validation: fileValidation.image
    }),
    validation(validator.updateComment),
    responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
         const data = await commentService.updatePost(req.params.commentId as string, req.validate.body, req.files as IFile[], req.user)
        console.log(req.validate.body);
        console.log(req.files);

        return {data}
    })
)




export default router