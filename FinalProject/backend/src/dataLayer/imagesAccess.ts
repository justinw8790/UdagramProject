import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
const XAWS = AWSXRay.captureAWS(AWS)
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { ImageItem } from '../models/ImageItem'
import { ImageUpdate } from '../models/ImageUpdate'
import { FriendItem } from '../models/FriendItem'

export class imagesAccess {
    constructor(
      private logger = createLogger('ImageAccess'),
      private imagesTable: string = process.env.IMAGES_TABLE,
      private friendsTable: string = process.env.FRIENDS_TABLE,
      private imagesCreatedAtIndex: string = process.env.IMAGES_CREATED_AT_INDEX,
      private docClient: DocumentClient = createDynamoDBClient()
    ) {}

    async createImage(ImageItem: ImageItem): Promise<ImageItem> {
        const params = {
          TableName: this.imagesTable,
          Item: ImageItem
        }
        this.logger.info(`Creating image`)
        const result = await this.docClient.put(params).promise()
        this.logger.info(result)
    
        return ImageItem as ImageItem
    }

    async deleteImage(imageId: string, userId: string): Promise<string> {
      this.logger.info(`Deleting image ${imageId} for userId ${userId}`)
  
      const params = {
        TableName: this.imagesTable,
        Key: {
          userId: userId,
          imageId: imageId
        }
      }
  
      const result = await this.docClient.delete(params).promise()
      this.logger.info(result)
  
      return '' as string
    }

    async getImages(userId: string, getFriendsImages: boolean): Promise<ImageItem[]> {
      this.logger.info(`Get all images for user ${userId}`)
      const params = {
        TableName: this.imagesTable,
        IndexName: this.imagesCreatedAtIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }
      const result = await this.docClient.query(params).promise()
      this.logger.info(result)
      var items = result.Items as ImageItem[]
      if (getFriendsImages)
      {
        var friendsImages = await this.getFriendImages(userId)
        items = items.concat(friendsImages)
        this.logger.info(items)
      }
      return items
    }

    async getFriendImages(userId: string): Promise<ImageItem[]> {
      this.logger.info(`Get all images from friends of logged in user ${userId}`)
      const params = {
        TableName: this.friendsTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }
      const result = await this.docClient.query(params).promise()
      this.logger.info(result)
      var images: ImageItem[] = []
      const items = result.Items as FriendItem[]
      for(let item of items)
      {
          var friendsImages = await this.getImages(item.friendId, false)
          images = images.concat(friendsImages)
      }
      return images
    }

    async updateImage(
      ImageUpdate: ImageUpdate,
      imageId: string,
      userId: string
    ): Promise<ImageUpdate> {
      this.logger.info(`Updating imageId ${imageId} for userId ${userId}`)
  
      const params = {
        TableName: this.imagesTable,
        Key: {
          userId: userId,
          imageId: imageId
        },
        UpdateExpression: 'set #a = :a',
        ExpressionAttributeNames: {
          '#a': 'name'
        },
        ExpressionAttributeValues: {
          ':a': ImageUpdate['name']
        },
        ReturnValues: 'ALL_NEW'
      }
  
      const result = await this.docClient.update(params).promise()
      this.logger.info(result)
      const attributes = result.Attributes
  
      return attributes as ImageUpdate
    }
}

function createDynamoDBClient()
    {
      if (process.env.IS_OFFLINE)
      {
        console.log('Creating local dynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
          accessKeyId: 'AKID',
          region: 'localhost',
          endpoint: 'http://localhost:8000'
        })
      }

      return new XAWS.DynamoDB.DocumentClient()
    }
