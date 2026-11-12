"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../../middleware");
const validator = __importStar(require("./post.validation"));
const multer_1 = require("../../common/utils/multer");
const enum_1 = require("../../common/enum");
const post_Service_1 = require("./post.Service");
const router = (0, express_1.Router)({ caseSensitive: true, strict: true });
router.post("/", (0, middleware_1.authentication)(), (0, middleware_1.uploadMulterUpload)({
    multerMetalware: (0, multer_1.localFileUpload)({ maxFileSize: 3, storageApproach: enum_1.StorageApproachEnum.MEMORY }).array("attachment"),
    customPath: "users",
    isRequired: false,
    validation: multer_1.fileValidation.image
}), (0, middleware_1.validation)(validator.createPost), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await post_Service_1.postService.createPost(req.validate.body, req.files, req.user);
    console.log({ data });
    return { data: data };
}));
router.get("/getPosts", (0, middleware_1.authentication)(), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await post_Service_1.postService.getAllPost(req.user);
    console.log({ data });
    return { data: data };
}));
router.get("/:postId", (0, middleware_1.authentication)(), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await post_Service_1.postService.getPostById(req.params.postId, req.user);
    return { data: data };
}));
router.delete("/:postId", (0, middleware_1.authentication)(), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await post_Service_1.postService.deletePost(req.params.postId, req.user);
    return { data: data };
}));
router.patch("/:postId", (0, middleware_1.authentication)(), (0, middleware_1.uploadMulterUpload)({
    multerMetalware: (0, multer_1.localFileUpload)({ maxFileSize: 3, storageApproach: enum_1.StorageApproachEnum.MEMORY }).array("attachment"),
    customPath: "users",
    isRequired: false,
    validation: multer_1.fileValidation.image
}), (0, middleware_1.validation)(validator.updatePost), (0, middleware_1.responseFormatter)(async (req, res, next) => {
    const data = await post_Service_1.postService.updatePost(req.params.postId, req.validate.body, req.files, req.user);
    console.log({ data });
    return { data };
}));
exports.default = router;
