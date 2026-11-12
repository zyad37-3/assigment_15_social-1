import { BadRequestException, NotFoundException } from "../../common/expiation";
import { IPost } from "../../common/interface/post.interface";
import { PostRepository, UserRepository } from "../../common/repository";
import { cashService, CashService, cloudService, CloudService } from "../../common/services";
import { IFile } from "../../common/types";
import { HUser } from "../../db/model";
import { CreateDto, updateDto } from "./dto/post.dto";


export class PostService {
    private cloudService: CloudService
    private cashService: CashService
    private postRepository: PostRepository
    private userRepository: UserRepository

    constructor() {
        this.cloudService = cloudService
        this.cashService = cashService
        this.postRepository = new PostRepository()
        this.userRepository = new UserRepository()
    }
    async createPost({ content }: CreateDto, files: IFile[], user: HUser):Promise<IPost> {

        const attachments = await Promise.all(
            files.map(file =>
                this.cloudService.updateAccess({
                    file,
                    folder: `User/${user._id}`
                })
            )
        )
        const create = await this.postRepository.create({
            data: {
                content,
                attachment: attachments,
                userId: user._id
            }
        })

        return create
    }
    async getAllPost(user: HUser):Promise<IPost[]>  {
        const postExist = await this.postRepository.find({
            filter: {
                userId: user._id
            }
        })


        if (postExist.length == 0) {
            throw new BadRequestException("not found posts")
        }
        return postExist
    }
    async getPostById(postId: string, user: HUser):Promise<IPost> {
        const postExist = await this.postRepository.findOne({
            filter: {
                _id: postId,
                userId: user._id
            }
        })

        if (!postExist) {
            throw new BadRequestException("not found posts")
        }
        return postExist
    }
    async deletePost(postId: string, user: HUser) {

        const postExist = await this.postRepository.deleteOne({
            filter: {
                _id: postId,
                userId: user._id
            }
        })

        if (!postExist.deletedCount) {
            throw new BadRequestException("invalid post")
        }
        return postExist
    }
    async updatePost(postId: string, { content }: updateDto, files: IFile[], user: HUser){

        const postExist = await this.postRepository.findOne({
            filter: {
                _id: postId,
                userId: user._id
            }
        })

        if (!postExist) {
            throw new BadRequestException("invalid post")
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
            ...(postExist.attachment ?? []),
            ...newAttachments
        ]

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
        })


        return updatedPost
    }
}
export const postService = new PostService()