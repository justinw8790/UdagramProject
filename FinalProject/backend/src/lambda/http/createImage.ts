import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreateImageRequest } from '../../requests/CreateImageRequest'
import { createImage } from '../../businessLayer/images'
import { createLogger } from '../../utils/logger'
import { getJwtToken } from '../utils'
import { attachmentUtils } from '../../helpers/attachmentUtils'
import { parseUserId } from '../../auth/utils'
import * as uuid from 'uuid'

const logger = createLogger('Images')
const attachmentUtil = new attachmentUtils()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing Event ', event)

    const jwtToken: string = getJwtToken(event)
    const newImage: CreateImageRequest = JSON.parse(event.body)

    const userId: string = parseUserId(jwtToken)
    logger.info(`User id parsed: ${userId}`)

    const imageItem = await createImage(newImage, userId, uuid.v4())
    const imageId = imageItem.imageId
    const url = attachmentUtil.generateUploadUrl(imageId)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: imageItem,
        uploadUrl: url
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
