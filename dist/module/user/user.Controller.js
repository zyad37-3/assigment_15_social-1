"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../../middleware");
const user_Service_1 = require("./user.Service");
const enum_1 = require("../../common/enum");
const utils_1 = require("../../common/utils");
const multer_1 = require("../../common/utils/multer");
const router = (0, express_1.Router)({ caseSensitive: true, strict: true });
router.get("/profile", (0, middleware_1.authentication)(), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    return { data: req.user };
}));
router.patch("/profile_image", (0, middleware_1.authentication)(), (0, middleware_1.uploadMulterUpload)({
    multerMetalware: (0, multer_1.localFileUpload)({ maxFileSize: 3, storageApproach: enum_1.StorageApproachEnum.MEMORY }).single("attachment"),
    customPath: "users",
    validation: multer_1.fileValidation.image
}), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const key = await user_Service_1.userService.profileImage(req.file, req.user);
    return { data: { key } };
}));
router.patch("/rotate_token", (0, middleware_1.authentication)(enum_1.TokenTypeEnum.REFRESH), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await user_Service_1.userService.rotateToken(req.user, req.payload, (0, utils_1.getIssuer)(req));
    return data;
}));
router.post("/logout", (0, middleware_1.authentication)(), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await user_Service_1.userService.logout(req.user, req.payload, req.body);
    return data;
}));
exports.default = router;
