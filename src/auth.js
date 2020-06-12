const authentication = require('@feathersjs/authentication')
const authenticationLocal = require('@feathersjs/authentication-local')

const { AuthenticationService, JWTStrategy } = authentication
const { LocalStrategy } = authenticationLocal

module.exports = function auth(app) {
  const authentication = new AuthenticationService(app)

  // register all of the strategies with authentication service
  authentication.register('local', new LocalStrategy())
  authentication.register('jwt', new JWTStrategy())
  // authentication.register('google', new OAuthStrategy())

  // register the authentication service with your app
  app.use('/authentication', authentication)

}