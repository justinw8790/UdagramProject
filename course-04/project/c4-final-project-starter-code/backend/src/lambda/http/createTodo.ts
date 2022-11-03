import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLayer/todos'
import { createLogger } from '../../utils/logger'
import { getJwtToken } from '../utils'
import { attachmentUtils } from '../../helpers/attachmentUtils'
import { parseUserId } from '../../auth/utils'
import * as uuid from 'uuid'

const logger = createLogger('Todos')
const attachmentUtil = new attachmentUtils()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing Event ', event)

    const jwtToken: string = getJwtToken(event)
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // verify a name is given
    if (!newTodo.name) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Must supply a name for the new todo.'
        })
      }
    }

    const userId: string = parseUserId(jwtToken)
    logger.info(`User id parsed: ${userId}`)

    const toDoItem = await createTodo(newTodo, userId, uuid.v4())
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
