"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOtp = void 0;
const createOtp = () => {
    return Math.floor(Math.random() * (1000000 - 100000) + 100000);
};
exports.createOtp = createOtp;
