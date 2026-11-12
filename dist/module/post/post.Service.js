"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = exports.PostService = void 0;
const expiation_1 = require("../../common/expiation");
const repository_1 = require("../../common/repository");
const services_1 = require("../../common/services");
class PostService {
    cloudService;
    cashService;
    postRepository;
    userRepository;
    constructor() {
        this.cloudService = services_1.cloudService;
        this.cashService = services_1.cashService;
        this.postRepository = new repository_1.PostRepository();
        this.userRepository = new repository_1.UserRepository();
    }
    async createPost({ content }, files, user) {
        const attachments = await Promise.all(files.map(file => this.cloudService.updateAccess({
            file,
            folder: `User/${user._id}`
        })));
        const create = await this.postRepository.create({
            data: {
                content,
                attachment: attachments,
                userId: user._id
            }
        });
        return create;
    }
    async getAllPost(user) {
        const postExist = await this.postRepository.find({
            filter: {
                userId: user._id
            }
        });
        if (postExist.length == 0) {
            throw new expiation_1.BadRequestException("not found posts");
        }
        return postExist;
    }
    async getPostById(postId, user) {
        const postExist = await this.postRepository.findOne({
            filter: {
                _id: postId,
                userId: user._id
            }
        });
        if (!postExist) {
            throw new expiation_1.BadRequestException("not found posts");
        }
        return postExist;
    }
    async deletePost(postId, user) {
        const postExist = await this.postRepository.deleteOne({
            filter: {
                _id: postId,
                userId: user._id
            }
        });
        if (!postExist.deletedCount) {
            throw new expiation_1.BadRequestException("invalid post");
        }
        return postExist;
    }
    async updatePost(postId, { content }, files, user) {
        const postExist = await this.postRepository.findOne({
            filter: {
                _id: postId,
                userId: user._id
            }
        });
        if (!postExist) {
            throw new expiation_1.BadRequestException("invalid post");
        }
        const newAttachments = await Promise.all((files ?? []).map(file => this.cloudService.updateAccess({
            file,
            folder: `User/${user._id}`
        })));
        const attachments = [
            ...(postExist.attachment ?? []),
            ...newAttachments
        ];
        const updatedPost = await this.postRepository.findOneAndUpdate({
            filter: {
                _id: postId,
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
exports.PostService = PostService;
exports.postService = new PostService();
