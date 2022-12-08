import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getImages } from '../../businessLayer/images'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('getImages')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing Event ', event)
    const userId: string = getUserId(event)
    logger.info(`User id parsed: ${userId}`)
    
    const images = await getImages(userId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: images
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
