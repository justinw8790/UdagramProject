import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { parseUserId } from '../auth/utils';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { getUserId } from '../lambda/utils';
import { TodoUpdate } from '../models/TodoUpdate';
import { todosAccess } from './todosAccess'
import { attachmentUtils } from './attachmentUtils'

const logger = createLogger('Todos')
const todosAccess2 = new todosAccess()
const attachmentUtil = new attachmentUtils()

const s3BucketName: string = process.env.S3_BUCKET_NAME
const s3BucketLocation: string = process.env.S3_BUCKET_LOCATION

export function createTodo(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string
  ): Promise<TodoItem> {
    logger.info('Retrieving userId from jwtToken')
    const userId: string = parseUserId(jwtToken)
    const todoId: string = uuid.v4()

    return todosAccess2.createTodo({
      userId,
      todoId,
      createdAt: new Date().getTime().toString(),
      done: false,
      attachmentUrl: `https://${s3BucketName}.${s3BucketLocation}/${todoId}`,
      ...createTodoRequest
    })
}

export function deleteTodo(todoId: string, jwtToken: string): Promise<string> {
    logger.info('Retrieving userId from jwtToken')
    const userId: string = parseUserId(jwtToken)

    return todosAccess2.deleteTodo(todoId, userId)
}

export async function getTodos(
    event: APIGatewayProxyEvent
  ): Promise<TodoItem[]> {
    logger.info('Retrieving userId from event')
    const userId: string = getUserId(event)

    return todosAccess2.getTodos(userId)
}

export function updateTodo(
    updateTodoRequest: UpdateTodoRequest,
    todoId: string,
    jwtToken: string
  ): Promise<TodoUpdate> {
    logger.info('Retrieving userId from jwtToken')
    const userId: string = parseUserId(jwtToken)

    return todosAccess2.updateTodo(updateTodoRequest, todoId, userId)
}
  
export function generateUploadUrl(todoId: string): Promise<string> {
    return attachmentUtil.generateUploadUrl(todoId)
}