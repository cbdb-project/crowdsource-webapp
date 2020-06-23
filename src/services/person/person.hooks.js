const {setField} = require('feathers-authentication-hooks');
const { authenticate } = require('@feathersjs/authentication').hooks
const { hashPassword } = require('@feathersjs/authentication-local').hooks
const { iff, isProvider, discard } = require('feathers-hooks-common')

const setUser = () => {
  
  setField({ from: 'params.user.id', as: 'params.query.userId' })};

module.exports = {
  before: {
    all: [],
    find: [authenticate('jwt'),setUser],
    // get: [authenticate('jwt'),setUser],
    create: [hashPassword('password')],
    update: [authenticate('jwt'), hashPassword('password')],
    // patch: [authenticate('local'), hashPassword()],
    remove: [authenticate('jwt'),setUser]
  },
  after: {
    all: [
      iff(isProvider('external'), discard('password'))
    ]
  }
}