"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = exports.authentication = void 0;
const index_js_1 = require("../common/enum/index.js");
const domain_Exception_js_1 = require("../common/expiation/domain.Exception.js");
const token_service_js_1 = require("../common/services/token.service.js");
const authentication = (tokenType = index_js_1.TokenTypeEnum.ACCESS) => {
    return async (req, res, next) => {
        const { authorization } = req.headers;
        if (!authorization) {
            throw new domain_Exception_js_1.UnauthorizedException("Unauthorized account");
        }
        const { user, payload } = await token_service_js_1.tokenService.decodedToken({ authorization, tokenType });
        req.user = user;
        req.payload = payload;
        next();
    };
};
exports.authentication = authentication;
const authorization = (accessRole) => {
    return async (req, res, next) => {
        if (req.user.role < accessRole) {
            throw new domain_Exception_js_1.ForbiddenException('forbidden account');
        }
        next();
    };
};
exports.authorization = authorization;
