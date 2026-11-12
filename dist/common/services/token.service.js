"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenService = exports.TokenService = void 0;
const cache_service_1 = require("./cache.service");
const user_repository_1 = require("./../repository/user.repository");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config");
const enum_1 = require("../enum");
const expiation_1 = require("../expiation");
const utils_1 = require("../utils");
const node_crypto_1 = require("node:crypto");
class TokenService {
    cashService;
    userRepository;
    constructor() {
        this.cashService = cache_service_1.cashService;
        this.userRepository = new user_repository_1.UserRepository();
    }
    async createRevokeToken({ payload }) {
        const consumedTime = (Date.now()) / 1000 - payload.iat;
        const refersExpires = payload.iat + config_1.REFRESH_TOKEN_EXPIRES_IN;
        const ttl = Math.ceil(refersExpires - consumedTime);
        await this.cashService.set({ key: await this.userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }), value: payload.jti, ttl });
        return;
    }
    async userBaseKey({ userId }) {
        return `User::${userId.toString()}`;
    }
    async userBaseRevokeTokenKey({ userId }) {
        return `${this.userBaseKey({ userId })}::Revoke_Token`;
    }
    async userRevokeTokenKey({ userId, jti }) {
        return `${this.userBaseRevokeTokenKey({ userId })}::${jti}`;
    }
    async userBaseProfileKey({ userId }) {
        return `User::${userId.toString()}::Profile`;
    }
    async createToken({ payload, signature = config_1.ACCESS_USER_TOKEN_SIGNATURE, options }) {
        return jsonwebtoken_1.default.sign(payload, signature, options);
    }
    async verifyToken({ token, signature = config_1.ACCESS_USER_TOKEN_SIGNATURE, }) {
        return jsonwebtoken_1.default.verify(token, signature);
    }
    async getTokenSignature({ role = enum_1.roleEnum.USER }) {
        let signature;
        switch (role) {
            case enum_1.roleEnum.ADMIN:
                signature = { accessSignature: config_1.ACCESS_ADMIN_TOKEN_SIGNATURE, refreshSignature: config_1.REFRESH_ADMIN_TOKEN_SIGNATURE };
                break;
            default:
                signature = { accessSignature: config_1.ACCESS_USER_TOKEN_SIGNATURE, refreshSignature: config_1.REFRESH_USER_TOKEN_SIGNATURE };
                break;
        }
        return signature;
    }
    async getSignature({ tokenType = enum_1.TokenTypeEnum.ACCESS, role = enum_1.roleEnum.USER }) {
        const signature = await this.getTokenSignature({ role });
        return tokenType == enum_1.TokenTypeEnum.ACCESS ? signature.accessSignature : signature.refreshSignature;
    }
    async decodedToken({ authorization = "", tokenType = enum_1.TokenTypeEnum.ACCESS }) {
        const decoded = jsonwebtoken_1.default.decode(authorization);
        if (!decoded?.aud?.length) {
            throw new expiation_1.BadRequestException('missing token payload');
        }
        const payload = await this.verifyToken({ token: authorization, signature: await this.getSignature({ tokenType, role: decoded.aud[0] }) });
        if (!payload?.sub) {
            throw new expiation_1.BadRequestException('missing token payload');
        }
        if (await this.cashService.exist({ key: await this.userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }) })) {
            throw new expiation_1.UnauthorizedException("expired token credentials");
        }
        const user = await this.userRepository.findById({ id: (0, utils_1.toObjectId)(payload.sub) });
        if (!user) {
            throw new expiation_1.NotFoundException('invalid account');
        }
        if ((user.changeCredentialsTime?.getTime() ?? 0) > payload.iat * 1000) {
            throw new expiation_1.UnauthorizedException("expired token credentials");
        }
        return { user, payload };
    }
    async createLoginCredentials({ issuer, user, option }) {
        const jwtid = (0, node_crypto_1.randomUUID)();
        const { accessSignature, refreshSignature } = await this.getTokenSignature({ role: user.role });
        const access_token = await this.createToken({
            signature: accessSignature,
            options: {
                ...option,
                audience: [user.role],
                issuer,
                expiresIn: config_1.ACCESS_TOKEN_EXPIRES_IN,
                jwtid
            },
            payload: { sub: user?._id }
        });
        const refresh_token = await this.createToken({
            signature: refreshSignature,
            options: {
                ...option,
                audience: [user.role],
                issuer,
                expiresIn: config_1.REFRESH_TOKEN_EXPIRES_IN,
                jwtid
            },
            payload: { sub: user?._id }
        });
        return { access_token, refresh_token };
    }
}
exports.TokenService = TokenService;
exports.tokenService = new TokenService();
