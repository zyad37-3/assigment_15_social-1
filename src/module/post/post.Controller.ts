import { NextFunction, Request, Response, Router } from "express";
import { authentication, responseFormatter, uploadMulterUpload, validation } from "../../middleware";
import * as validator from "./post.validation"
import { fileValidation, localFileUpload } from "../../common/utils/multer";
import { StorageApproachEnum } from "../../common/enum";
import { postService } from "./post.Service";
import { IFile } from "../../common/types";

const router = Router({ caseSensitive: true, strict: true });



router.post("/",
    authentication(),
    uploadMulterUpload({
        multerMetalware: localFileUpload({ maxFileSize: 3, storageApproach: StorageApproachEnum.MEMORY }).array("attachment"),
        customPath: "users",
        isRequired: false,
        validation: fileValidation.image
    }),
    validation(validator.createPost),
    responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await postService.createPost(req.validate.body, req.files as IFile[], req.user)
        console.log({ data });
        return { data: data }
    })
)
router.get("/getPosts",
    authentication(),
    responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await postService.getAllPost(req.user)
        console.log({ data });
        return { data: data }
    })
)
router.get("/:postId",
    authentication(),
    responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await postService.getPostById(req.params.postId as string, req.user)
        return { data: data }
    })
)
router.delete("/:postId",
    authentication(),
    responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await postService.deletePost(req.params.postId as string, req.user)
        return { data: data }
    })
)
router.patch("/:postId",
    authentication(),
    uploadMulterUpload({
        multerMetalware: localFileUpload({ maxFileSize: 3, storageApproach: StorageApproachEnum.MEMORY }).array("attachment"),
        customPath: "users",
        isRequired: false,
        validation: fileValidation.image
    }),
    validation(validator.updatePost),
    responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await postService.updatePost(req.params.postId as string, req.validate.body, req.files as IFile[], req.user)

        console.log({ data });

        return { data }
    })
)




export default router