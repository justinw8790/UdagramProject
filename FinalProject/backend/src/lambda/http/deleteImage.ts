import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { deleteImage } from '../../businessLayer/images'
import { getJwtToken } from '../utils'
import { createLogger } from '../../utils/logger'
import { parseUserId } from '../../auth/utils'

const logger = createLogger('deleteImage')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing Event ', event)

    const jwtToken = getJwtToken(event)
    const userId: string = parseUserId(jwtToken)
    logger.info(`User id parsed: ${userId}`)
    
    const imageId = event.pathParameters.imageId
    const delImage = await deleteImage(imageId, userId)

    return {
      statusCode: 200,
      body: delImage
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
