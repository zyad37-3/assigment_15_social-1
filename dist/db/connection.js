"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_js_1 = require("../config.js");
const bootstrapDB = async (app, port) => {
    try {
        await mongoose_1.default.connect(config_js_1.DB_URI);
        console.log('successfully your connection ✔✔');
        app.listen(port, () => { console.log(`Connected as a server 👌 .. ${port}`); });
    }
    catch (error) {
        console.log(error);
        console.log('failed your connection ❌');
    }
};
exports.bootstrapDB = bootstrapDB;
