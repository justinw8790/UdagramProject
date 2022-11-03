import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate';
import { todosAccess } from '../dataLayer/todosAccess'
import { attachmentUtils } from '../helpers/attachmentUtils'

const todosAccess2 = new todosAccess()
const attachmentUtil = new attachmentUtils()

const s3BucketName: string = process.env.S3_BUCKET_NAME
const s3BucketLocation: string = process.env.S3_BUCKET_LOCATION

export function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string,
    todoId: string
  ): Promise<TodoItem> {

    return todosAccess2.createTodo({
      userId,
      todoId,
      createdAt: new Date().getTime().toString(),
      done: false,
      attachmentUrl: `https://${s3BucketName}.${s3BucketLocation}/${todoId}`,
      ...createTodoRequest
    })
}

export function deleteTodo(todoId: string, userId: string): Promise<string> {
    return todosAccess2.deleteTodo(todoId, userId)
}

export async function getTodos(
    userId: string
  ): Promise<TodoItem[]> {
    return todosAccess2.getTodos(userId)
}

export function updateTodo(
    updateTodoRequest: UpdateTodoRequest,
    todoId: string,
    userId: string
  ): Promise<TodoUpdate> {
    return todosAccess2.updateTodo(updateTodoRequest, todoId, userId)
}
  
export function generateUploadUrl(todoId: string): Promise<string> {
    return attachmentUtil.generateUploadUrl(todoId)
}