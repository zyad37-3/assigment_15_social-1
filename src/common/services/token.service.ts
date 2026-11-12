import { cashService, CashService } from './cache.service';
import { UserRepository } from './../repository/user.repository';
import mongoose from 'mongoose';

import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken"
import { ACCESS_ADMIN_TOKEN_SIGNATURE, ACCESS_TOKEN_EXPIRES_IN, ACCESS_USER_TOKEN_SIGNATURE, REFRESH_ADMIN_TOKEN_SIGNATURE, REFRESH_TOKEN_EXPIRES_IN, REFRESH_USER_TOKEN_SIGNATURE } from '../../config';
import { roleEnum, TokenTypeEnum } from '../enum';
import { BadRequestException, NotFoundException, UnauthorizedException } from '../expiation';
import { toObjectId } from '../utils';
import { HUser } from '../../db/model';
import { randomUUID } from 'node:crypto';
type UserIdType = mongoose.Types.ObjectId | string
export type JwtPayloadType = JwtPayload & {
    sub: string;
    aud: number[];
    jti: string;
    iat: number
}
export class TokenService {
    private readonly cashService: CashService;
    private readonly userRepository: UserRepository
    constructor() {
        this.cashService = cashService
        this.userRepository = new UserRepository()
    }



    async createRevokeToken  ({ payload }:{ payload:JwtPayloadType })  {


        //الوقت المستغرق
        const consumedTime = (Date.now()) / 1000 - payload.iat
        //بدون ما استدعيها exp as refreshToken جبت 
        const refersExpires = payload.iat + REFRESH_TOKEN_EXPIRES_IN
        //token وقت نفاذ 
        const ttl = Math.ceil(refersExpires - consumedTime)

        await this.cashService.set({ key:await this.userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }), value: payload.jti, ttl })
        return;

    }
    async userBaseKey({ userId }: { userId: UserIdType }): Promise<string> {
        return `User::${userId.toString()}`
    }
    async userBaseRevokeTokenKey({ userId }: { userId: UserIdType }): Promise<string> {
        return `${this.userBaseKey({ userId })}::Revoke_Token`
    }
    async userRevokeTokenKey({ userId, jti }: { userId: UserIdType, jti: string }): Promise<string> {
        return `${this.userBaseRevokeTokenKey({ userId })}::${jti}`
    }

    async userBaseProfileKey({ userId }: { userId: UserIdType }): Promise<string> {
        return `User::${userId.toString()}::Profile`
    }


    async createToken({

        payload,
        signature = ACCESS_USER_TOKEN_SIGNATURE,
        options
    }: {
        payload: string | Buffer | object,
        signature: Secret,
        options?: SignOptions
    }): Promise<string> {
        return jwt.sign(payload, signature, options)
    }


    async verifyToken({
        token,
        signature = ACCESS_USER_TOKEN_SIGNATURE,

    }: {
        token: string,
        signature: Secret,

    }): Promise<JwtPayloadType> {
        return jwt.verify(token, signature) as JwtPayloadType
    }


    async getTokenSignature({ role = roleEnum.USER }: { role: roleEnum }): Promise<{ accessSignature: string, refreshSignature: string }> {
        let signature: { accessSignature: string, refreshSignature: string }
        switch (role) {
            case roleEnum.ADMIN:
                signature = { accessSignature: ACCESS_ADMIN_TOKEN_SIGNATURE, refreshSignature: REFRESH_ADMIN_TOKEN_SIGNATURE }
                break;

            default:
                signature = { accessSignature: ACCESS_USER_TOKEN_SIGNATURE, refreshSignature: REFRESH_USER_TOKEN_SIGNATURE }

                break;
        }
        return signature
    }


    async getSignature({ tokenType = TokenTypeEnum.ACCESS, role = roleEnum.USER }: { tokenType: TokenTypeEnum, role?: roleEnum }): Promise<string> {
        const signature = await this.getTokenSignature({ role })
        return tokenType == TokenTypeEnum.ACCESS ? signature.accessSignature : signature.refreshSignature
    }


    async decodedToken({
        authorization = "",
        tokenType = TokenTypeEnum.ACCESS
    }: {
        authorization: string,
        tokenType?: TokenTypeEnum

    }):Promise<{user:HUser,payload:JwtPayloadType}> {
        const decoded = jwt.decode(authorization) as JwtPayloadType

        if (!decoded?.aud?.length) {
            throw new BadRequestException('missing token payload')
        }

        const payload = await this.verifyToken({ token: authorization, signature: await this.getSignature({ tokenType, role: decoded.aud[0] as unknown as roleEnum }) })

        if (!payload?.sub) {
            throw new BadRequestException('missing token payload')
        }
        if (await this.cashService.exist({ key:await this.userRevokeTokenKey({ userId: payload.sub, jti: payload.jti }) })) {
            throw new UnauthorizedException("expired token credentials")
        }
        const user = await this.userRepository.findById({ id: toObjectId(payload.sub) })




        if (!user) {
            throw new NotFoundException('invalid account')
        }
        if ((user.changeCredentialsTime?.getTime() ?? 0) > payload.iat * 1000) {
            throw new UnauthorizedException("expired token credentials")
        }

        return { user, payload }
    }


    async createLoginCredentials ({
        issuer,
        user,
        option 
    }:{
       issuer:string,
        user:HUser,
        option?:SignOptions,
    }) :Promise<{access_token:string, refresh_token:string}> {
        const jwtid = randomUUID()
        const { accessSignature, refreshSignature } = await this.getTokenSignature({ role: user.role })
        const access_token = await this.createToken(
            {
                signature: accessSignature,
                options: {
                    ...option,
                    audience: [user.role as unknown as string],
                    issuer,
                    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
                    jwtid
                },
                payload: { sub: user?._id }
            }
        )

        const refresh_token = await this.createToken(
            {
                signature: refreshSignature,
                options: {
                    ...option,
                    audience: [user.role as unknown as string],
                    issuer,
                    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
                    jwtid
                },
                payload: { sub: user?._id }
            }
        )


        return { access_token, refresh_token }
    }

}

export const tokenService = new TokenService()