import { BadRequestException, NotFoundException } from "../../common/expiation";
import { commentRepository, PostRepository, UserRepository } from "../../common/repository";
import { cashService, CashService, cloudService, CloudService } from "../../common/services";
import { IFile } from "../../common/types";
import { HPost, HUser } from "../../db/model";
import { CreateDto, updateDto } from "./dto/post.dto";


export class CommentService {
    private cloudService: CloudService
    private cashService: CashService
    private postRepository: PostRepository
    private userRepository: UserRepository
    private commentRepository: commentRepository

    constructor() {
        this.cloudService = cloudService
        this.cashService = cashService
        this.postRepository = new PostRepository()
        this.userRepository = new UserRepository()
        this.commentRepository = new commentRepository()
    }
    async createComment(data: CreateDto, files: IFile[], user: HUser) {
        console.log({ data });

        const account = await this.postRepository.findOne({
            filter: {
                _id: data.postId,

            }
        })

        if (!account) {
            throw new BadRequestException("invalid post")
        }
        const attachments = await Promise.all(
            (files ?? [])?.map(file =>
                this.cloudService.updateAccess({
                    file,
                    folder: `User/${user._id}`
                })
            )
        )
        const create = await this.commentRepository.create({
            data: {
                content: data.content,
                attachment: attachments,
                userId: user._id,
                postId: data.postId
            }
        })

        return create
    }
    async getPostAndComment(postId: string) {
        const postExist = await this.postRepository.findOne({
            filter: {
                _id: postId
            }
        })


        if (!postExist) {
            throw new BadRequestException("not found posts")
        }
        const comments = await this.commentRepository.find({
            filter: {
                postId: postId
            }
        })

        return {
            post: postExist,
            comments
        }
    }
    async getCommentById(commentId: string) {
        const commentExist = await this.commentRepository.findOne({
            filter: {
                _id: commentId,

            }
        })

        if (!commentExist) {
            throw new BadRequestException("comment not found")
        }
        return commentExist
    }
    async deleteComment(commentId: string, user: HUser) {
        const commentExist = await this.commentRepository.findOne({
            filter: { _id: commentId }
        })

        if (!commentExist) {
            throw new BadRequestException("comment not found")
        }

        const isCommentOwner =
            commentExist.userId.toString() === user._id.toString()

        const postExist = await this.postRepository.findOne({
            filter: {
                _id: commentExist.postId,
                userId: user._id
            }
        })

        if (!isCommentOwner && !postExist) {
            throw new BadRequestException("not authorized to delete this comment")
        }
        const deleteComment = await this.commentRepository.deleteOne({
            filter: {
                _id: commentId,
            }
        })

        if (!deleteComment.deletedCount) {
            throw new BadRequestException("invalid post")
        }
        return deleteComment
    }
    async updatePost(commentId: string, { content }: updateDto, files: IFile[], user: HUser) {

        const commentExist = await this.commentRepository.findOne({
            filter: {
                _id: commentId,
                userId: user._id
            }
        })

        if (!commentExist) {
            throw new BadRequestException("invalid comment")
        }
        const newAttachments = await Promise.all(
            (files ?? []).map(file =>
                this.cloudService.updateAccess({
                    file,
                    folder: `User/${user._id}`
                })
            )
        )
        const attachments = [
            ...(commentExist.attachment ?? []),
            ...newAttachments
        ]

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
        })

        return updatedPost
    }
}
export const commentService = new CommentService()