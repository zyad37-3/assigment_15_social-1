import { NextFunction, Request, Response } from 'express';
import { roleEnum, TokenTypeEnum } from '../common/enum/index.js';
import { ForbiddenException, UnauthorizedException } from '../common/expiation/domain.Exception.js';
import { tokenService } from '../common/services/token.service.js';

export const authentication = (tokenType = TokenTypeEnum.ACCESS) => {
    return async (req:Request, res:Response, next:NextFunction) => {
        const { authorization } = req.headers 
        if (!authorization) {
            throw new UnauthorizedException( "Unauthorized account" )
        }
        const { user, payload } = await tokenService.decodedToken({ authorization, tokenType }) 
        req.user = user
        req.payload = payload

        next()

    }
}
export const authorization = (accessRole:roleEnum) => {
        
    return async (req:Request, res:Response, next:NextFunction) => {
        if (req.user.role < accessRole) {
            throw new ForbiddenException('forbidden account')
        }

        next()

    }
}
