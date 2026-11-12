"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentModel = exports.commentSchema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.commentSchema = new mongoose_1.default.Schema({
    attachment: {
        type: [String],
    },
    content: {
        type: String,
        minlength: 2,
        trim: true,
        required: function () {
            return this.attachment?.length > 0 ? false : true;
        }
    },
    postId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
}, {
    timestamps: true
});
exports.commentModel = mongoose_1.default.models.Comment || mongoose_1.default.model("Comment", exports.commentSchema);
