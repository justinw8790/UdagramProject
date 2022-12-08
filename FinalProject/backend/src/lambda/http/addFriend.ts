import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getJwtToken } from '../utils'
import { parseUserId } from '../../auth/utils'
import * as uuid from 'uuid'
import { addFriend } from '../../businessLayer/friends'
import { AddFriendRequest } from '../../requests/AddFriendRequest'

const logger = createLogger('AddFriend')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing Event ', event)

    const jwtToken: string = getJwtToken(event)
    const newFriend: AddFriendRequest = JSON.parse(event.body)

    const userId: string = parseUserId(jwtToken)
    logger.info(`User id parsed: ${userId}`)

    const friendItem = await addFriend(newFriend, userId, uuid.v4())

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: friendItem
      })
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
