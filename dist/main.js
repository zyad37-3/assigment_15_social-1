"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const module_1 = require("./module");
const middleware_1 = require("./middleware");
const config_1 = require("./config");
const connection_1 = require("./db/connection");
const app = (0, express_1.default)();
(0, connection_1.bootstrapDB)(app, config_1.PORT);
app.use(express_1.default.json());
app.all("/", async (req, res, next) => {
    return res.status(200).json({ message: "hello world" });
});
app.use("/auth", module_1.authenticationController);
app.use(middleware_1.globalErrorHandling);
