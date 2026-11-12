"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.localFileUpload = exports.fileValidation = void 0;
exports.processFile = processFile;
exports.processFiles = processFiles;
exports.processFields = processFields;
exports.processMulterUpload = processMulterUpload;
const multer_1 = __importDefault(require("multer"));
const node_crypto_1 = require("node:crypto");
const promises_1 = require("node:fs/promises");
const file_type_1 = require("file-type");
const node_path_1 = require("node:path");
const expiation_1 = require("../../expiation");
const enum_1 = require("../../enum");
const node_os_1 = require("node:os");
exports.fileValidation = {
    image: [
        "image/jpeg",
        "image/png",
        "image/gif"
    ],
    files: [
        "application/pdf",
        "application/json"
    ]
};
const localFileUpload = ({ maxFileSize = 5, storageApproach = enum_1.StorageApproachEnum.MEMORY }) => {
    const storage = storageApproach == enum_1.StorageApproachEnum.MEMORY ?
        multer_1.default.memoryStorage() :
        multer_1.default.diskStorage({
            destination(req, file, callback) {
                console.log("Disk Storage:", (0, node_os_1.tmpdir)());
                callback(null, (0, node_os_1.tmpdir)());
            },
            filename(req, file, callback) {
                callback(null, (0, node_crypto_1.randomUUID)() + file.originalname);
            },
        });
    return (0, multer_1.default)({ storage, limits: { fileSize: maxFileSize * 1024 * 1024 } });
};
exports.localFileUpload = localFileUpload;
async function processFile({ customPath = "general", file, validation }) {
    if (file.path) {
        file.buffer = await (0, promises_1.readFile)(file.path);
    }
    const result = await (0, file_type_1.fileTypeFromBuffer)(file.buffer);
    if (!result || !validation.includes(result.mime)) {
        await (0, promises_1.unlink)(file.path);
        throw new expiation_1.BadRequestException("invalid file format");
    }
    else {
        if (file.path) {
            await (0, promises_1.unlink)(file.path);
        }
        return file;
    }
}
async function processFiles({ customPath = "general", files, validation }) {
    const assets = [];
    try {
        for (const file of files) {
            const uploadFile = await processFile({ customPath, file, validation });
            assets.push(uploadFile);
        }
        return assets;
    }
    catch (error) {
        for (const file of assets) {
            await (0, promises_1.unlink)((0, node_path_1.resolve)(`./${file.path}`));
        }
        throw new expiation_1.BadRequestException("invalid file format 1");
    }
}
async function processFields({ customPath = "general", fields, validation }) {
    const assets = [];
    try {
        for (const field of Object.keys(fields)) {
            const file = await processFiles({ customPath, files: fields[field], validation });
            assets.push({ field, file });
        }
        return assets;
    }
    catch (error) {
        for (const asset of assets) {
            for (const file of asset.file) {
                if (file.path) {
                    await (0, promises_1.unlink)((0, node_path_1.resolve)(file.path)).catch(() => { });
                }
            }
        }
        throw error;
    }
}
async function processMulterUpload({ customPath = "general", validation, req }) {
    if (req.file) {
        await processFile({ customPath, file: req.file, validation });
    }
    else if (Array.isArray(req.files)) {
        await processFiles({ customPath, files: req.files, validation });
    }
    else if (typeof req.files == "object" && Object.keys(req.files)?.length) {
        await processFields({ customPath, fields: req.files, validation });
    }
}
