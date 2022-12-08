// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const url = 'https://73cuhns5w6.execute-api.us-east-1.amazonaws.com'
export const apiEndpoint = `${url}/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-8o7z6-3k.us.auth0.com',            // Auth0 domain
  clientId: 'tN6yAGOdqEwjEDocTdRShz28BksuVsMn',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
