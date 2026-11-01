export interface IResponse<T = any, Z = any> {
    status?: number;
    message?: boolean;
    data?: T;
    extra?: Z;

}