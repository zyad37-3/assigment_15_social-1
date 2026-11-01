"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compare = exports.hash = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const hash = async (myPlaintext, round = 12, minor = `b`) => {
    const salt = await bcrypt_1.default.genSalt(round, minor);
    return await bcrypt_1.default.hash(myPlaintext, salt);
};
exports.hash = hash;
const compare = async (myPlaintext, cipherText) => {
    return await bcrypt_1.default.compare(myPlaintext, cipherText);
};
exports.compare = compare;
