"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentRepository = void 0;
const model_1 = require("../../db/model");
const base_repository_1 = require("./base.repository");
class commentRepository extends base_repository_1.DataBaseRepository {
    constructor() {
        super(model_1.commentModel);
    }
}
exports.commentRepository = commentRepository;
