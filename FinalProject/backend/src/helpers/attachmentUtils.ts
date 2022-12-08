import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
//const XAWS = AWSXRay.captureAWS(AWS)
import { createLogger } from '../utils/logger'
import { Types } from 'aws-sdk/clients/s3'

export class attachmentUtils {
    constructor(
        private logger = createLogger('AttachmentUtils'),
        private s3Client: Types = new AWS.S3({ signatureVersion: 'v4' }),
        private s3BucketName: string = process.env.S3_BUCKET_NAME
      ) {}

    async generateUploadUrl(todoId: string): Promise<string> {
        this.logger.info(`Generating URL for todoId ${todoId}`)
    
        const url = this.s3Client.getSignedUrl('putObject', {
          Bucket: this.s3BucketName,
          Key: todoId,
          Expires: 3000
        })
        this.logger.info(url)
    
        return url as string
      }
}