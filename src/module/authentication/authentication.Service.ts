import { ConflictException, NotFoundException, ToManyRequestException } from "../../common/expiation/domain.Exception";
import { ConfirmEmailDto, ResendConfirmEmailDto, SighupDto } from "./dto/authentication.dto";

import { UserRepository } from "../../common/repository";
import { cashService, CashService } from "../../common/services";
import { encrypt, hash } from "../../common/security";
import { emailEvent, userEmailKey, userEmailTrialsKey } from "../../common/utils/email";
import { EmailSubjectEnum } from "../../common/enum";
import { createOtp } from "../../common/utils";
import { compare } from "bcrypt";
import { IUser } from "../../common/interface";

export class Authentication {
    private userRepository: UserRepository
    private cashService: CashService
    constructor() {
        this.cashService = cashService
        this.userRepository = new UserRepository()
    }

    async sendEmailOtp({ mess, email, subject, expiresIn = 120, maxTrials = 3, blockInSeconds = 300 }: { mess?: string, email: string, subject: EmailSubjectEnum, expiresIn?: number, maxTrials?: number, blockInSeconds?: number }) {
        //300==>5 minutes
        this.cashService
        const existOtp_TTl = await this.cashService.ttl({ key: userEmailKey({ email, subject: subject }) })
        if (existOtp_TTl > 0) {
            throw new ConflictException(`sorry we cannot create now otp while existed one still valid please try again later after ${existOtp_TTl}s`)
        }
        const oldTrials = await this.cashService.get({ key: userEmailTrialsKey({ email, subject: subject }) }) ?? 0
        if (oldTrials >= maxTrials) {
            throw new ToManyRequestException("many otp Trials has been reached")
        }

        const code = createOtp()
        await this.cashService.set({
            key: userEmailKey({ email, subject: subject }),
            value: await hash(code.toString()),
            ttl: expiresIn
        })

        const currentTrials = await this.cashService.incrBy({ key: userEmailTrialsKey({ email, subject: subject }) })
        if (currentTrials == 3) {
            await this.cashService.expire({ key: userEmailTrialsKey({ email, subject: subject }), ttl: blockInSeconds })
        }

        emailEvent.emit("sendEmail", { recipients: { to: email }, subject: subject, data: { code: code, title: mess } })

    }



    async signup({ email, password, userName, phone }: SighupDto["body"]):Promise<IUser> {
        const user = await this.userRepository.findOne({ filter: { email } })
        if (user) {
            throw new ConflictException('user is exist ')
        }

        const account = await this.userRepository.createOne({
            data: {
                email,
                password: await hash(password),
                userName,
                phone: await encrypt(phone)
            },
        })


        await this.sendEmailOtp({ mess: "Confirm your email", email, subject: EmailSubjectEnum.CONFIRM_EMAIL })
        return account
    }

    async confirmEmail({ email, otp }: ConfirmEmailDto) :Promise<void>{
        const account = await this.userRepository.findOne({ filter: { email: email, confirmEmail: { $exists: false } } })
        if (!account) {
            throw new NotFoundException('invalid account ')
        }
        const otpHash = await this.cashService.get({ key: userEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }) })

        if (!otpHash || !await compare(otp, otpHash)) {
            throw new ConflictException('invalid otp ')
        }

        account.confirmEmail = new Date() as unknown as string
        await account.save()
        await this.cashService.del({ key: await this.cashService.keys({ key: userEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }) }) })
        return;

    }
    async resendConfirmEmail({ email }: ResendConfirmEmailDto):Promise<void> {
        const user = await this.userRepository.findOne({ filter: { email: email, confirmEmail: { $exists: false } } })
        if (!user) {
            throw new NotFoundException('invalid account ')
        }
        await this.sendEmailOtp({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL })

        return;

    }
}

//singleton Pattern
export default new Authentication()