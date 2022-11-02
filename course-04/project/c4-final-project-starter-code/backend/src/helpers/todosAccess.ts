import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

export class todosAccess {
    constructor(
      private logger = createLogger('TodosAccess'),
      private todosTable: string = process.env.TODOS_TABLE,
      private todosCreatedAtIndex: string = process.env.TODOS_CREATED_AT_INDEX,
      private docClient: DocumentClient = createDynamoDBClient()
    ) {}

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        const params = {
          TableName: this.todosTable,
          Item: todoItem
        }
        this.logger.info(`Creating todo`)
        const result = await this.docClient.put(params).promise()
        this.logger.info(result)
    
        return todoItem as TodoItem
    }

    async deleteTodo(todoId: string, userId: string): Promise<string> {
      this.logger.info(`Deleting todo ${todoId} for userId ${userId}`)
  
      const params = {
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        }
      }
  
      const result = await this.docClient.delete(params).promise()
      this.logger.info(result)
  
      return '' as string
    }

    async getTodos(userId: string): Promise<TodoItem[]> {
      this.logger.info(`Get all todos of logged in user ${userId}`)
      const params = {
        TableName: this.todosTable,
        IndexName: this.todosCreatedAtIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }
      const result = await this.docClient.query(params).promise()
      this.logger.info(result)
      const items = result.Items
      return items as TodoItem[]
    }

    async updateTodo(
      todoUpdate: TodoUpdate,
      todoId: string,
      userId: string
    ): Promise<TodoUpdate> {
      this.logger.info(`Updating todoId ${todoId} for userId ${userId}`)
  
      const params = {
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        },
        UpdateExpression: 'set #a = :a, #b = :b, #c = :c',
        ExpressionAttributeNames: {
          '#a': 'name',
          '#b': 'dueDate',
          '#c': 'done'
        },
        ExpressionAttributeValues: {
          ':a': todoUpdate['name'],
          ':b': todoUpdate['dueDate'],
          ':c': todoUpdate['done']
        },
        ReturnValues: 'ALL_NEW'
      }
  
      const result = await this.docClient.update(params).promise()
      this.logger.info(result)
      const attributes = result.Attributes
  
      return attributes as TodoUpdate
    }
}

function createDynamoDBClient()
    {
      if (process.env.IS_OFFLINE)
      {
        console.log('Creating local dynamoDB instance')
        return new AWS.DynamoDB.DocumentClient({
          accessKeyId: 'AKID',
          region: 'localhost',
          endpoint: 'http://localhost:8000'
        })
      }

      return new AWS.DynamoDB.DocumentClient()
    }
