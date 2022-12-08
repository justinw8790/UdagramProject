import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { updateImage } from '../../businessLayer/images'
import { UpdateImageRequest } from '../../requests/UpdateImageRequest'
import { getJwtToken } from '../utils'
import { createLogger } from '../../utils/logger'
import { parseUserId } from '../../auth/utils'

const logger = createLogger('updateImages')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing Event ', event)

    const jwtToken = getJwtToken(event)
    const userId: string = parseUserId(jwtToken)
    logger.info(`User id parsed: ${userId}`)
    
    const imageId = event.pathParameters.imageId
    const updatedImage: UpdateImageRequest = JSON.parse(event.body)
    const imageItem = await updateImage(updatedImage, imageId, userId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        item: imageItem
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
