import { NextFunction, Request, Response, Router } from "express";

import { IResponse, IUser } from "../../common/interface";
// import * as validator from "./authentication.validation";
import { authentication, authorization, responseFormatter, uploadMulterUpload } from "../../middleware";
import { userService } from './user.Service';
import { StorageApproachEnum, TokenTypeEnum } from "../../common/enum";
import { getIssuer } from "../../common/utils";
import { fileValidation, localFileUpload } from "../../common/utils/multer";
import { IFile } from "../../common/types";

const router = Router({ caseSensitive: true, strict: true });

router.get("/profile",
    authentication(),
    responseFormatter(
        async (req: Request, res: Response, next: NextFunction): Promise<IResponse<IUser>> => {
            // const data = await authService.signup(req.validate.body)
            return { data: req.user }
        }))

router.patch("/profile_image",
    authentication(),
    uploadMulterUpload({
        multerMetalware: localFileUpload({ maxFileSize: 3, storageApproach: StorageApproachEnum.MEMORY }).single("attachment"),
        customPath: "users",
        validation: fileValidation.image
    }),
    responseFormatter(
        async (req: Request, res: Response, next: NextFunction): Promise<IResponse<Record<string, string>>> => {
            const key = await userService.profileImage(req.file as IFile, req.user)
            return { data: { key } }
        }))
router.patch("/rotate_token",
    authentication(TokenTypeEnum.REFRESH),
    responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await userService.rotateToken(req.user, req.payload, getIssuer(req))
        return data
    })
)

router.post("/logout",
    authentication(),
    responseFormatter(async (req: Request, res: Response, next: NextFunction) => {
        const data = await userService.logout(req.user, req.payload, req.body)
        return data
    })
)

export default router
