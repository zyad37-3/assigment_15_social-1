"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutEnum = exports.LangEnum = exports.TokenTypeEnum = void 0;
var TokenTypeEnum;
(function (TokenTypeEnum) {
    TokenTypeEnum[TokenTypeEnum["ACCESS"] = 0] = "ACCESS";
    TokenTypeEnum[TokenTypeEnum["REFRESH"] = 1] = "REFRESH";
})(TokenTypeEnum || (exports.TokenTypeEnum = TokenTypeEnum = {}));
var LangEnum;
(function (LangEnum) {
    LangEnum[LangEnum["AR"] = 0] = "AR";
    LangEnum[LangEnum["EN"] = 1] = "EN";
})(LangEnum || (exports.LangEnum = LangEnum = {}));
var LogoutEnum;
(function (LogoutEnum) {
    LogoutEnum[LogoutEnum["DEVISE"] = 0] = "DEVISE";
    LogoutEnum[LogoutEnum["ALL"] = 1] = "ALL";
})(LogoutEnum || (exports.LogoutEnum = LogoutEnum = {}));
