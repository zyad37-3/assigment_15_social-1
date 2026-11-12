"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentService = exports.CommentService = void 0;
const expiation_1 = require("../../common/expiation");
const repository_1 = require("../../common/repository");
const services_1 = require("../../common/services");
class CommentService {
    cloudService;
    cashService;
    postRepository;
    userRepository;
    commentRepository;
    constructor() {
        this.cloudService = services_1.cloudService;
        this.cashService = services_1.cashService;
        this.postRepository = new repository_1.PostRepository();
        this.userRepository = new repository_1.UserRepository();
        this.commentRepository = new repository_1.commentRepository();
    }
    async createComment(data, files, user) {
        console.log({ data });
        const account = await this.postRepository.findOne({
            filter: {
                _id: data.postId,
            }
        });
        if (!account) {
            throw new expiation_1.BadRequestException("invalid post");
        }
        const attachments = await Promise.all((files ?? [])?.map(file => this.cloudService.updateAccess({
            file,
            folder: `User/${user._id}`
        })));
        const create = await this.commentRepository.create({
            data: {
                content: data.content,
                attachment: attachments,
                userId: user._id,
                postId: data.postId
            }
        });
        return create;
    }
    async getPostAndComment(postId) {
        const postExist = await this.postRepository.findOne({
            filter: {
                _id: postId
            }
        });
        if (!postExist) {
            throw new expiation_1.BadRequestException("not found posts");
        }
        const comments = await this.commentRepository.find({
            filter: {
                postId: postId
            }
        });
        return {
            post: postExist,
            comments
        };
    }
    async getCommentById(commentId) {
        const commentExist = await this.commentRepository.findOne({
            filter: {
                _id: commentId,
            }
        });
        if (!commentExist) {
            throw new expiation_1.BadRequestException("comment not found");
        }
        return commentExist;
    }
    async deleteComment(commentId, user) {
        const commentExist = await this.commentRepository.findOne({
            filter: { _id: commentId }
        });
        if (!commentExist) {
            throw new expiation_1.BadRequestException("comment not found");
        }
        const isCommentOwner = commentExist.userId.toString() === user._id.toString();
        const postExist = await this.postRepository.findOne({
            filter: {
                _id: commentExist.postId,
                userId: user._id
            }
        });
        if (!isCommentOwner && !postExist) {
            throw new expiation_1.BadRequestException("not authorized to delete this comment");
        }
        const deleteComment = await this.commentRepository.deleteOne({
            filter: {
                _id: commentId,
            }
        });
        if (!deleteComment.deletedCount) {
            throw new expiation_1.BadRequestException("invalid post");
        }
        return deleteComment;
    }
    async updatePost(commentId, { content }, files, user) {
        const commentExist = await this.commentRepository.findOne({
            filter: {
                _id: commentId,
                userId: user._id
            }
        });
        if (!commentExist) {
            throw new expiation_1.BadRequestException("invalid comment");
        }
        const newAttachments = await Promise.all((files ?? []).map(file => this.cloudService.updateAccess({
            file,
            folder: `User/${user._id}`
        })));
        const attachments = [
            ...(commentExist.attachment ?? []),
            ...newAttachments
        ];
        const updatedPost = await this.commentRepository.findOneAndUpdate({
            filter: {
                _id: commentId,
                userId: user._id
            },
            update: {
                ...(content !== undefined && { content }),
                attachment: attachments
            },
            options: {
                new: true
            }
        });
        return updatedPost;
    }
}
exports.CommentService = CommentService;
exports.commentService = new CommentService();
