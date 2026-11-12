"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authentication = void 0;
const domain_Exception_1 = require("../../common/expiation/domain.Exception");
const repository_1 = require("../../common/repository");
const services_1 = require("../../common/services");
const security_1 = require("../../common/security");
const email_1 = require("../../common/utils/email");
const enum_1 = require("../../common/enum");
const utils_1 = require("../../common/utils");
const bcrypt_1 = require("bcrypt");
class Authentication {
    userRepository;
    cashService;
    tokenService;
    constructor() {
        this.cashService = services_1.cashService;
        this.tokenService = services_1.tokenService;
        this.userRepository = new repository_1.UserRepository();
    }
    async sendEmailOtp({ mess, email, subject, expiresIn = 120, maxTrials = 3, blockInSeconds = 300 }) {
        this.cashService;
        const existOtp_TTl = await this.cashService.ttl({ key: (0, email_1.userEmailKey)({ email, subject: subject }) });
        if (existOtp_TTl > 0) {
            throw new domain_Exception_1.ConflictException(`sorry we cannot create now otp while existed one still valid please try again later after ${existOtp_TTl}s`);
        }
        const oldTrials = await this.cashService.get({ key: (0, email_1.userEmailTrialsKey)({ email, subject: subject }) }) ?? 0;
        if (oldTrials >= maxTrials) {
            throw new domain_Exception_1.ToManyRequestException("many otp Trials has been reached");
        }
        const code = (0, utils_1.createOtp)();
        await this.cashService.set({
            key: (0, email_1.userEmailKey)({ email, subject: subject }),
            value: await (0, security_1.hash)(code.toString()),
            ttl: expiresIn
        });
        const currentTrials = await this.cashService.incrBy({ key: (0, email_1.userEmailTrialsKey)({ email, subject: subject }) });
        if (currentTrials == 3) {
            await this.cashService.expire({ key: (0, email_1.userEmailTrialsKey)({ email, subject: subject }), ttl: blockInSeconds });
        }
        email_1.emailEvent.emit("sendEmail", { recipients: { to: email }, subject: subject, data: { code: code, title: mess } });
    }
    async signup({ email, password, userName, phone }) {
        const user = await this.userRepository.findOne({ filter: { email } });
        if (user) {
            throw new domain_Exception_1.ConflictException('user is exist ');
        }
        const account = await this.userRepository.createOne({
            data: {
                email,
                password,
                userName,
                phone
            },
        });
        await this.sendEmailOtp({ mess: "Confirm your email", email, subject: enum_1.EmailSubjectEnum.CONFIRM_EMAIL });
        return account;
    }
    async confirmEmail({ email, otp }) {
        const account = await this.userRepository.findOne({ filter: { email: email, confirmEmail: { $exists: false } } });
        if (!account) {
            throw new domain_Exception_1.NotFoundException('invalid account ');
        }
        const otpHash = await this.cashService.get({ key: (0, email_1.userEmailKey)({ email, subject: enum_1.EmailSubjectEnum.CONFIRM_EMAIL }) });
        if (!otpHash || !await (0, bcrypt_1.compare)(otp, otpHash)) {
            throw new domain_Exception_1.ConflictException('invalid otp ');
        }
        account.confirmEmail = new Date();
        await account.save();
        await this.cashService.del({ key: await this.cashService.keys({ key: (0, email_1.userEmailKey)({ email, subject: enum_1.EmailSubjectEnum.CONFIRM_EMAIL }) }) });
        return;
    }
    async resendConfirmEmail({ email }) {
        const user = await this.userRepository.findOne({ filter: { email: email, confirmEmail: { $exists: false } } });
        if (!user) {
            throw new domain_Exception_1.NotFoundException('invalid account ');
        }
        await this.sendEmailOtp({ email, subject: enum_1.EmailSubjectEnum.CONFIRM_EMAIL });
        return;
    }
    async login({ email, password }, issuer) {
        const user = await this.userRepository.findOne({ filter: { email, confirmEmail: { $exists: true } } });
        if (!user) {
            throw new domain_Exception_1.NotFoundException('user is not found');
        }
        const existTtl = await this.cashService.ttl({ key: (0, email_1.userEmailTrialsKey)({ email, subject: enum_1.EmailSubjectEnum.FORGOT_PASSWORD }) });
        if (existTtl > 0) {
            throw new domain_Exception_1.ToManyRequestException(`Try again after ${existTtl} seconds`);
        }
        const match = await (0, bcrypt_1.compare)(password, user.password);
        if (!match) {
            const currentTrials = await this.cashService.incrBy({ key: (0, email_1.userEmailTrialsKey)({ email, subject: enum_1.EmailSubjectEnum.FORGOT_PASSWORD }) });
            if (currentTrials >= 5) {
                await this.cashService.expire({ key: (0, email_1.userEmailTrialsKey)({ email, subject: enum_1.EmailSubjectEnum.FORGOT_PASSWORD }), ttl: 120 });
                throw new domain_Exception_1.ToManyRequestException("Too many failed attempts. Try again after 2 minutes.");
            }
            throw new domain_Exception_1.NotFoundException('user is not found');
        }
        user.phone = await (0, security_1.decrypt)(user.phone);
        await this.cashService.del({ key: (0, email_1.userEmailTrialsKey)({ email, subject: enum_1.EmailSubjectEnum.FORGOT_PASSWORD }) });
        return await this.tokenService.createLoginCredentials({ user, issuer });
    }
}
exports.Authentication = Authentication;
exports.default = new Authentication();
