import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
import { getJwtToken } from '../utils'
import { attachmentUtils } from '../../helpers/attachmentUtils'

const logger = createLogger('Todos')
const attachmentUtil = new attachmentUtils()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing Event ', event)

    const jwtToken = getJwtToken(event)
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const toDoItem = await createTodo(newTodo, jwtToken)
    const todoId = toDoItem.todoId
    const url = attachmentUtil.generateUploadUrl(todoId)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: toDoItem,
        uploadUrl: url
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
)
