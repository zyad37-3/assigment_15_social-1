// declare module==>معناها إنك بتقول لـ إنك عايز توسّع تعريفات الموديول ده.  
declare module "express-serve-static-core" {
    interface Request {
        validate: any
    }
}
