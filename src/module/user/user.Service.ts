
import { LogoutEnum } from "../../common/enum";
import { ConflictException } from "../../common/expiation";
import { UserRepository } from "../../common/repository";
import { cashService, CashService, cloudService, CloudService, JwtPayloadType, tokenService, TokenService } from "../../common/services";
import { IFile } from "../../common/types";
import { ACCESS_TOKEN_EXPIRES_IN } from "../../config";
import { HUser } from "../../db/model";


export class UserService {
    private userRepository: UserRepository
    private cashService: CashService
    private tokenService: TokenService
    private cloudService: CloudService
    constructor() {
        this.cloudService = cloudService
        this.cashService = cashService
        this.tokenService = tokenService
        this.userRepository = new UserRepository()
    }
    async profileImage(file: IFile, user: HUser):Promise<string> {
        const key = await this.cloudService.updateAccess ({
            file,
            folder: `User/${user._id.toString()}`
        })
        return key
    }

    async rotateToken(user: HUser, payload: JwtPayloadType, issuer: string) {
        const accessExpires = (payload.iat + ACCESS_TOKEN_EXPIRES_IN) * 1000
        const currentTime = Date.now() + (3 * 60000)
        if (currentTime < accessExpires) {
            throw new ConflictException("sorry we can not creat now login creadentials while current access token stilled within  valid")
        }
        const data = await this.tokenService.createLoginCredentials({ user, issuer })
        await this.tokenService.createRevokeToken({ payload })
        return data
    }

    async logout(user: HUser, payload: JwtPayloadType, { action = LogoutEnum.DEVISE }: { action: LogoutEnum }) {


        switch (action) {
            case LogoutEnum.ALL:
                user.changeCredentialsTime = new Date()
                await user.save()
                await this.cashService.del({ key: await this.cashService.keys({ key: await this.tokenService.userBaseRevokeTokenKey({ userId: payload.sub }) }) })
                break;

            default:
                await this.tokenService.createRevokeToken({ payload })
                break;
        }
        return
    }

}

//singleton Pattern
export const userService = new UserService()