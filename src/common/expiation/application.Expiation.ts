//الاصح==short hand because override ==>method is optionبتعمل كدا لو ال
export class ApplicationException extends Error {
    constructor(override message: string, public status: number,override cause?: unknown) {
        super()
        this.name=this.constructor.name
        //عشان يمسك الخطا صح //throw error true in (postman)
        Error.captureStackTrace(this,this.constructor)
    }
}
// export class ApplicationException extends Error {
//     constructor(message: string, public status: number, cause?: unknown) {
//         super(message, { cause })
//         this.name=this.constructor.name
//         //عشان يمسك الخطا صح //throw error true in (postman)
//         Error.captureStackTrace(this,this.constructor)
//     }
// }

