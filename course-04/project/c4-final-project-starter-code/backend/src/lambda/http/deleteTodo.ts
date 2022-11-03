import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { deleteTodo } from '../../businessLayer/todos'
import { getJwtToken } from '../utils'
import { createLogger } from '../../utils/logger'
import { parseUserId } from '../../auth/utils'

const logger = createLogger('deleteTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing Event ', event)

    const jwtToken = getJwtToken(event)
    const userId: string = parseUserId(jwtToken)
    logger.info(`User id parsed: ${userId}`)
    
    const todoId = event.pathParameters.todoId
    const delTodo = await deleteTodo(todoId, userId)

    return {
      statusCode: 200,
      body: delTodo
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
