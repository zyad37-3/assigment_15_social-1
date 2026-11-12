import { ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { APPLICATION_NAME, AWS_ACCESS_KEY_ID, AWS_ACCESS_SECRET_KEY, AWS_BUCKET_NAME, AWS_REGION } from "../../config";
import { randomUUID } from "node:crypto";
import { BadRequestException } from "../expiation";

export class CloudService {
    private cloudClint: S3Client
    constructor() {
        this.cloudClint = new S3Client({
            region: AWS_REGION,
            credentials: {
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_ACCESS_SECRET_KEY,
            },
        })
    }
    async updateAccess({ file, Bucket = AWS_BUCKET_NAME, ACL = ObjectCannedACL.private, folder = "general" }: { Bucket?: string, ACL?: ObjectCannedACL, file: Express.Multer.File, folder?: string }): Promise<string> {
        const Key = `${APPLICATION_NAME}/${folder}/${randomUUID()}_${file.originalname}`
        const command = new PutObjectCommand({
            Bucket,
            Key,
            ACL,
            Body: file.buffer,

        })
        await this.cloudClint.send(command)
        if (!command.input.Key) {
            throw new BadRequestException("fail to upload this asset")
        }

        return command.input.Key
    }
}
export const cloudService = new CloudService()