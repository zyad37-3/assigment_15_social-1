"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const postSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
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
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});
exports.PostModel = mongoose_1.default.models.Post || mongoose_1.default.model("Post", postSchema);
