import mongoose, { HydratedDocument } from "mongoose";
import { IPost } from "../../common/interface/post.interface";

const postSchema = new mongoose.Schema<IPost>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
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
        required: function (){
            return this.attachment?.length > 0 ? false : true 
        }
    },
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },

})

export const PostModel = mongoose.models.Post || mongoose.model<IPost>("Post", postSchema)
export type HPost = HydratedDocument<IPost>


    // comments: {
    //     type: [{
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "Comment",

    //     }]
    // },
