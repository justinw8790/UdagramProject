import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
const XAWS = AWSXRay.captureAWS(AWS)
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { FriendItem } from '../models/FriendItem'

export class friendsAccess {
    constructor(
      private logger = createLogger('FriendsAccess'),
      private friendsTable: string = process.env.FRIENDS_TABLE,
      private imagesTable: string = process.env.IMAGES_TABLE,
      private docClient: DocumentClient = createDynamoDBClient()
    ) {}

    async addFriend(friendItem: FriendItem): Promise<FriendItem> {
        let friendExists = await this.friendExists(friendItem.friendId);
        if (!friendExists) {
          throw new Error('Friend does not exist')
        }
        const params = {
          TableName: this.friendsTable,
          Item: friendItem
        }
        this.logger.info(`Adding friend`)
        const result = await this.docClient.put(params).promise()
        this.logger.info(result)
    
        return friendItem as FriendItem
    }

    async deleteFriend(friendId: string, userId: string): Promise<string> {
      this.logger.info(`Deleting friend ${friendId} for userId ${userId}`)
  
      const params = {
        TableName: this.friendsTable,
        Key: {
          userId: userId,
          friendId: friendId
        }
      }
  
      const result = await this.docClient.delete(params).promise()
      this.logger.info(result)
  
      return '' as string
    }

    async friendExists(friendId: string): Promise<boolean> {
      this.logger.info(`Checking that ${friendId} exists`)
  
      const params = {
        TableName: this.imagesTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': friendId
        }
      }
      const result = await this.docClient.query(params).promise()
      this.logger.info(result)
  
      return result.Items.length != 0
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
