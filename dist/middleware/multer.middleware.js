"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMulterUpload = uploadMulterUpload;
const local_multer_js_1 = require("../common/utils/multer/local.multer.js");
const domain_Exception_js_1 = require("../common/expiation/domain.Exception.js");
function uploadMulterUpload({ isRequired = true, multerMetalware, customPath = "general", validation = [] }) {
    return async (req, res, next) => {
        multerMetalware(req, res, async (error) => {
            if (error) {
                next(new Error(error.message, { cause: { status: 400 } }));
                return;
            }
            try {
                if (isRequired &&
                    (!req.file &&
                        !(Array.isArray(req.files) && req.files.length) &&
                        !(typeof req.files == "object" && Object.keys(req.files)?.length))) {
                    next(new domain_Exception_js_1.BadRequestException("file is required"));
                    return;
                }
                await (0, local_multer_js_1.processMulterUpload)({ customPath, validation, req });
                next();
            }
            catch (error) {
                next(new Error(error.message, { cause: { status: 400 } }));
            }
        });
    };
}
