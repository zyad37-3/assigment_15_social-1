"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const config_1 = require("../../config");
const algorithm = 'aes-256-cbc';
const encrypt = async (plaintext) => {
    const iv = node_crypto_1.default.randomBytes(config_1.IV_LENGTH);
    const cipher = node_crypto_1.default.createCipheriv(algorithm, config_1.ENC_KEY, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}::${encrypted}`;
};
exports.encrypt = encrypt;
const decrypt = async (cipherText) => {
    const [iv, encrypted] = cipherText.split("::");
    const iv_Vector = Buffer.from(iv, 'hex');
    const decipherVector = node_crypto_1.default.createDecipheriv(algorithm, config_1.ENC_KEY, iv_Vector);
    let plainText = decipherVector.update(encrypted, 'hex', 'utf8');
    plainText += decipherVector.final('utf8');
    return plainText;
};
exports.decrypt = decrypt;
