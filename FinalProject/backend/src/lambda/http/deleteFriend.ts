import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getJwtToken } from '../utils'
import { parseUserId } from '../../auth/utils'
import { deleteFriend } from '../../businessLayer/friends'

const logger = createLogger('DeleteFriend')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing Event ', event)

    const jwtToken: string = getJwtToken(event)

    const userId: string = parseUserId(jwtToken)
    logger.info(`User id parsed: ${userId}`)

    const friendId = event.pathParameters.friendId
    const friendItem = await deleteFriend(friendId, userId)

    return {
      statusCode: 200,
      body: friendItem
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      origin:'*',
      credentials: true
    })
)
