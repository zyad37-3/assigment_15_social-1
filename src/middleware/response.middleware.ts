
import { NextFunction, Request, Response } from 'express';
import { IResponse } from '../common/interface';

export const responseFormatter =
    (handler: Function) => {
        return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
            const {
                status = 200,
                data = true,
                message = undefined,
                extra = undefined
            }: IResponse = await handler(req, res, next) || {}
            //error ميعملش res عشان لو بعت 
            if (res.headersSent) return;
            return res.status(status).json({ status, message, data, extra })
        }

    }


