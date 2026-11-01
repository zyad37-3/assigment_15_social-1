"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.creatLoginCredentials = exports.decodedToken = exports.verifyToken = exports.createToken = exports.userBaseProfileKey = exports.userRevokeTokenKey = exports.userBaseRevokeTokenKey = exports.userBaseKey = exports.createRevokeToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_js_1 = require("../../config.js");
const db_respository_js_1 = require("../respository/db.respository.js");
const error_exception_js_1 = require("../exceptions/error.exception.js");
const user_model_js_1 = require("../../db/model/user.model.js");
const security_tokenTypeEnum_js_1 = require("../enum/security.tokenTypeEnum.js");
const user_enum_js_1 = require("../enum/user.enum.js");
const node_crypto_1 = require("node:crypto");
const index_js_1 = require("../services/index.js");
const createRevokeToken = async ({ payload }) => {
    const consumedTime = (Date.now()) / 1000 - payload.iat;
    const refersExpiresIn = payload.iat + config_js_1.REFRESH_TOKEN_EXPIRES_IN;
    const ttl = Math.ceil(refersExpiresIn - consumedTime);
    await (0, index_js_1.set)({ key: (0, exports.userRevokeTokenKey)({ userId: payload.sub, jti: payload.jti }), value: payload.jti, ttl });
    return;
};
exports.createRevokeToken = createRevokeToken;
const userBaseKey = ({ userId }) => {
    return `User::${userId.toString()}`;
};
exports.userBaseKey = userBaseKey;
const userBaseRevokeTokenKey = ({ userId }) => {
    return `${(0, exports.userBaseKey)({ userId })}::Revoke_Token`;
};
exports.userBaseRevokeTokenKey = userBaseRevokeTokenKey;
const userRevokeTokenKey = ({ userId, jti }) => {
    return `${(0, exports.userBaseRevokeTokenKey)({ userId })}::${jti}`;
};
exports.userRevokeTokenKey = userRevokeTokenKey;
const userBaseProfileKey = ({ userId }) => {
    return `User::${userId.toString()}::Profile`;
};
exports.userBaseProfileKey = userBaseProfileKey;
const createToken = async ({ payload = {}, signature = config_js_1.ACCESS_USER_TOKEN_SIGNATURE, option = {} }) => {
    return jsonwebtoken_1.default.sign(payload, signature, option);
};
exports.createToken = createToken;
const verifyToken = async ({ token = {}, signature = config_js_1.ACCESS_USER_TOKEN_SIGNATURE, }) => {
    return jsonwebtoken_1.default.verify(token, signature);
};
exports.verifyToken = verifyToken;
const getTokenSignature = async ({ role = user_enum_js_1.roleEnum.USER }) => {
    let signature;
    switch (role) {
        case user_enum_js_1.roleEnum.ADMIN:
            signature = { accessSignature: config_js_1.ACCESS_ADMIN_TOKEN_SIGNATURE, refreshSignature: config_js_1.REFRESH_ADMIN_TOKEN_SIGNATURE };
            break;
        default:
            signature = { accessSignature: config_js_1.ACCESS_USER_TOKEN_SIGNATURE, refreshSignature: config_js_1.REFRESH_USER_TOKEN_SIGNATURE };
            break;
    }
    return signature;
};
const getSignature = async ({ tokenType = security_tokenTypeEnum_js_1.TokenTypeEnum.ACCESS, role = user_enum_js_1.roleEnum.USER } = {}) => {
    const signature = await getTokenSignature({ role });
    return tokenType == security_tokenTypeEnum_js_1.TokenTypeEnum.ACCESS ? signature.accessSignature : signature.refreshSignature;
};
const decodedToken = async ({ authorization = "", tokenType = security_tokenTypeEnum_js_1.TokenTypeEnum.ACCESS }) => {
    const decoded = jsonwebtoken_1.default.decode(authorization);
    if (!decoded?.aud?.length) {
        throw (0, error_exception_js_1.BadRequestException)({ message: 'missing token payload' });
    }
    const payload = await (0, exports.verifyToken)({ token: authorization, signature: await getSignature({ tokenType, role: decoded.aud[0] }) });
    if (!payload?.sub) {
        throw (0, error_exception_js_1.BadRequestException)({ message: 'missing token payload' });
    }
    if (await (0, index_js_1.exist)({ key: (0, exports.userRevokeTokenKey)({ userId: payload.sub, jti: payload.jti }) })) {
        throw (0, error_exception_js_1.UnauthorizedException)({ message: "expired token credentials" });
    }
    const user = await (0, db_respository_js_1.findById)({ id: payload.sub, model: user_model_js_1.Usermodel });
    if (!user) {
        throw (0, error_exception_js_1.NotFoundException)({ message: 'invalid account' });
    }
    if ((user.changeCredetialsTime.getTime() ?? 0) > payload.iat * 1000) {
        throw (0, error_exception_js_1.UnauthorizedException)({ message: "expired token credentials" });
    }
    return { user, payload };
};
exports.decodedToken = decodedToken;
const creatLoginCredentials = async ({ issuer, user, option = {} }) => {
    const jwtid = (0, node_crypto_1.randomUUID)();
    const { accessSignature, refreshSignature } = await getTokenSignature({ role: user.role });
    const access_token = await (0, exports.createToken)({
        signature: accessSignature,
        option: {
            ...option,
            audience: [user.role],
            issuer,
            expiresIn: config_js_1.ACCESS_TOKEN_EXPIRES_IN,
            jwtid
        },
        payload: { sub: user?._id }
    });
    const refresh_token = await (0, exports.createToken)({
        signature: refreshSignature,
        option: {
            ...option,
            audience: [user.role],
            issuer,
            expiresIn: config_js_1.REFRESH_TOKEN_EXPIRES_IN,
            jwtid
        },
        payload: { sub: user?._id }
    });
    return { access_token, refresh_token };
};
exports.creatLoginCredentials = creatLoginCredentials;
