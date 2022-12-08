import { ImageItem } from '../models/ImageItem'
import { CreateImageRequest } from '../requests/CreateImageRequest'
import { UpdateImageRequest } from '../requests/UpdateImageRequest'
import { ImageUpdate } from '../models/ImageUpdate';
import { imagesAccess } from '../dataLayer/imagesAccess'
import { attachmentUtils } from '../helpers/attachmentUtils'

const imagesAccess2 = new imagesAccess()
const attachmentUtil = new attachmentUtils()

const s3BucketName: string = process.env.S3_BUCKET_NAME
const s3BucketLocation: string = process.env.S3_BUCKET_LOCATION

export function createImage(
    createImageRequest: CreateImageRequest,
    userId: string,
    imageId: string
  ): Promise<ImageItem> {

    return imagesAccess2.createImage({
      userId,
      imageId,
      createdAt: new Date().getTime().toString(),
      attachmentUrl: `https://${s3BucketName}.${s3BucketLocation}/${imageId}`,
      ...createImageRequest
    })
}

export function deleteImage(imageId: string, userId: string): Promise<string> {
    return imagesAccess2.deleteImage(imageId, userId)
}

export async function getImages(
    userId: string
  ): Promise<ImageItem[]> {
    return imagesAccess2.getImages(userId, true)
}

export function updateImage(
    updateImageRequest: UpdateImageRequest,
    imageId: string,
    userId: string
  ): Promise<ImageUpdate> {
    return imagesAccess2.updateImage(updateImageRequest, imageId, userId)
}
  
export function generateUploadUrl(imageId: string): Promise<string> {
    return attachmentUtil.generateUploadUrl(imageId)
}