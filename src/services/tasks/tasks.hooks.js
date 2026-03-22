const { setField } = require('feathers-authentication-hooks');
const { authenticate } = require('@feathersjs/authentication').hooks
const { hashPassword } = require('@feathersjs/authentication-local').hooks
const { iff, isProvider, discard } = require('feathers-hooks-common')
// const checkPermissions = require('feathers-permissions');

const setUser = () => {

  setField({ from: 'params.user.id', as: 'params.query.userId' })
};

module.exports = {
  before: {
    all: [],
    find: [authenticate('jwt'), setUser],
    get: [authenticate('jwt'), setUser],
    create: [hashPassword('password')],
    update: [authenticate('jwt'), setUser],
    remove: [authenticate('jwt'), setUser]

  },
  after: {
    all: [
      iff(isProvider('external'), discard('password'))
    ]
  }
}