"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountStatusEnum = exports.roleEnum = exports.genderEnum = void 0;
var genderEnum;
(function (genderEnum) {
    genderEnum[genderEnum["MALE"] = 0] = "MALE";
    genderEnum[genderEnum["FEMALE"] = 1] = "FEMALE";
})(genderEnum || (exports.genderEnum = genderEnum = {}));
var roleEnum;
(function (roleEnum) {
    roleEnum[roleEnum["USER"] = 0] = "USER";
    roleEnum[roleEnum["ADMIN"] = 1] = "ADMIN";
})(roleEnum || (exports.roleEnum = roleEnum = {}));
var AccountStatusEnum;
(function (AccountStatusEnum) {
    AccountStatusEnum[AccountStatusEnum["ACTIVE"] = 0] = "ACTIVE";
    AccountStatusEnum[AccountStatusEnum["ARCHIVE"] = 1] = "ARCHIVE";
})(AccountStatusEnum || (exports.AccountStatusEnum = AccountStatusEnum = {}));
