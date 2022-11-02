import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, JwtPayload } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'

const logger = createLogger('auth')
const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJHToF+qZ2S1hvMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi04bzd6Ni0zay51cy5hdXRoMC5jb20wHhcNMjIxMDExMjIzNjE4WhcN
MzYwNjE5MjIzNjE4WjAkMSIwIAYDVQQDExlkZXYtOG83ejYtM2sudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAws4IiA4kms9lPS6s
k+kwmQadNJsOhyoniv028nMkj/4ISkHSn5VSbxaRPu/0bWbx3Uc7ARx7eJG+wFZD
ZdZzV3ob1bT/vTBpGiN2U3gfDXoEWiX/jXBPDBCI2bZOI1GGsOKzqVWVYU8YHUBK
VqxSm8YUdjNu7SiibfkJ8ylzh0OXYoQ8uOIyLY/XYWNg9sDcBWHjluPvvpd0LY+V
Nydjxe7KDTTAbcbm0g81i+/tpTocP6JD65Nr0Hvo5KHMS6I/Iq0HtpiPwWde0yK8
mxrunP7R1FTfIusqIIbPaB0IdO1P7UBml4jW+QXqmYJzv23BOgnCr+KibkPusBPh
ON94XwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBR2WPyzGLlI
mb5XHd1MPCLoKLGFTTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AH94tobS0UiiM2rwHsOjLaVzvEhMRD09pCcOKNe7k/zpjya9A6LyzWownrrBrQNC
I9udZo/z9+ACXVHjk1SjhRhiA4Erq4tR+T6k5HXYtUyLakQ7agttgwbzWUwX9RKF
l9fCuqE2QzMiMwQD5Ypxgh72LNeR19DlaxV1srHJtbqaD6MPq/Rk4o/xlXSMHISt
PJds3jXYYugcOwpXhyTNdstse1lc31KCA1ul6fnxtiTUugsLWNrtMqraKh3PMXy0
FmiNRWBQKoZ+K3z+oidjhN4td/z1LrBSF+yTzm8RFxOjMp+3kAP3y/rAdmGHnT2H
lNjZtd0PjIpn7pADJQkfGHI=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  var token = getToken(authHeader)
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
