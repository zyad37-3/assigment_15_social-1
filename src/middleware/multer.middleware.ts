import { NextFunction, Request, RequestHandler, Response } from "express";
import { processMulterUpload } from "../common/utils/multer/local.multer.js";
import { BadRequestException } from "../common/expiation/domain.Exception.js";

export function uploadMulterUpload({ isRequired = true, multerMetalware, customPath = "general", validation = [] }:{ isRequired? :boolean, multerMetalware:RequestHandler, customPath :string, validation :string[]}) {
    return async (req:Request, res:Response, next:NextFunction) => {
        //multerMetalware ==> هى (single and array and any) name=>multerMetalware
        multerMetalware(req, res, async (error?:any) => {
            if (error) {
                next(new Error(error.message, { cause: { status: 400 } }))
                return;

            }
            try {
                if (isRequired &&
                    (!req.file &&
                        !(Array.isArray(req.files) && req.files.length) &&
                        !(typeof req.files == "object" && Object.keys(req.files)?.length))) {
                    next(new BadRequestException( "file is required" ))
                    return;
                }
                await processMulterUpload({ customPath, validation, req })
                next()

            } catch (error:any) {
                next(new Error(error.message, { cause: { status: 400 } }))

            }
        })



    }
}
