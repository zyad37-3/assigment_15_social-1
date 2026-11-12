"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const enum_1 = require("../../common/enum");
const expiation_1 = require("../../common/expiation");
const repository_1 = require("../../common/repository");
const services_1 = require("../../common/services");
const config_1 = require("../../config");
class UserService {
    userRepository;
    cashService;
    tokenService;
    cloudService;
    constructor() {
        this.cloudService = services_1.cloudService;
        this.cashService = services_1.cashService;
        this.tokenService = services_1.tokenService;
        this.userRepository = new repository_1.UserRepository();
    }
    async profileImage(file, user) {
        const key = await this.cloudService.updateAccess({
            file,
            folder: `User/${user._id.toString()}`
        });
        return key;
    }
    async rotateToken(user, payload, issuer) {
        const accessExpires = (payload.iat + config_1.ACCESS_TOKEN_EXPIRES_IN) * 1000;
        const currentTime = Date.now() + (3 * 60000);
        if (currentTime < accessExpires) {
            throw new expiation_1.ConflictException("sorry we can not creat now login creadentials while current access token stilled within  valid");
        }
        const data = await this.tokenService.createLoginCredentials({ user, issuer });
        await this.tokenService.createRevokeToken({ payload });
        return data;
    }
    async logout(user, payload, { action = enum_1.LogoutEnum.DEVISE }) {
        switch (action) {
            case enum_1.LogoutEnum.ALL:
                user.changeCredentialsTime = new Date();
                await user.save();
                await this.cashService.del({ key: await this.cashService.keys({ key: await this.tokenService.userBaseRevokeTokenKey({ userId: payload.sub }) }) });
                break;
            default:
                await this.tokenService.createRevokeToken({ payload });
                break;
        }
        return;
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
