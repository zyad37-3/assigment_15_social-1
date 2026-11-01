import { NextFunction, Request, Response, Router } from "express";
import authService from "./authentication.Service"
import { responseFormatter } from "../../middleware";
import { IResponse, IUser } from "../../common/interface";
import { validation } from "../../middleware/validation.middleware";
import * as validator from "./authentication.validation";

const router = Router();

router.post("/sighup",
    validation(validator.signupSchema),
    responseFormatter(
        async (req: Request, res: Response, next: NextFunction): Promise<IResponse<IUser>> => {
            const data = await authService.signup(req.validate.body)
            return { status: 200, data }
        }))
router.post("/confirm_Email",
    validation(validator.confirmEmailSchema), 
    responseFormatter(
    async (req: Request, res: Response, next: NextFunction) => {
    await authService.confirmEmail(req.validate.body)
 

}))


router.post("/resend_Confirm_Email",
     validation(validator.resendConfirmEmailSchema), 
    responseFormatter(
    async (req: Request, res: Response, next: NextFunction) => {
    await authService.resendConfirmEmail(req.validate.body)
 

}))

export default router
