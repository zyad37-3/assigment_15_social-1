"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const enum_1 = require("../common/enum");
const expiation_1 = require("../common/expiation");
const validation = (schema) => {
    return (req, res, next) => {
        const lang = Number(req.headers['lang']) || enum_1.LangEnum.EN;
        const validation = schema(lang).safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
            files: req.files
        });
        if (!validation.success) {
            throw new expiation_1.BadRequestException("validation error", { issues: validation.error.issues });
        }
        req.validate = validation.data;
        next();
    };
};
exports.validation = validation;
