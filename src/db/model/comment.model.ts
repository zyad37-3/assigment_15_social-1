import mongoose from "mongoose";
import { IComment } from "../../common/interface";
import { HydratedDocument } from "mongoose";


export const commentSchema = new mongoose.Schema<IComment>({
    attachment: {
        type: [String],
    },
    content: {
        type: String,
        minlength: 2,
        trim:true,
        required: function (): boolean {
            return this.attachment?.length > 0 ? false : true
        }
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

},
    {
        timestamps: true
    })
export const commentModel = mongoose.models.Comment || mongoose.model<IComment>("Comment", commentSchema)
export type HComment = HydratedDocument<IComment>
