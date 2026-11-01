import { ApplicationException } from "./application.Expiation"

export class BadRequestException extends ApplicationException {
    constructor(message = "BadRequest", cause?: unknown) {
        super(message, 400, cause)
    }
}
export class ConflictException extends ApplicationException {
    constructor(message= "Conflict", cause?: unknown) {
        super(message, 409, cause)
    }
}
export class NotFoundException extends ApplicationException {
    constructor(message= "NotFound", cause?: unknown) {
        super(message, 404, cause)
    }
}
export class ToManyRequestException extends ApplicationException {
    constructor(message= "ToManyRequest", cause?: unknown) {
        super(message, 429, cause)
    }
}
export class UnauthorizedException extends ApplicationException {
    constructor(message= "Unauthorized", cause?: unknown) {
        super(message, 401, cause)
    }
}
export class ForbiddenException extends ApplicationException {
    constructor(message= "Forbidden", cause?: unknown) {
        super(message, 403, cause)
    }
}
