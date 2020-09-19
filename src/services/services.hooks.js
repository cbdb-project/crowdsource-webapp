const { when } = require('feathers-hooks-common');
const {authorize} = require('./hooks/abilities');
const authenticate = require('./hooks/authenticate');


module.exports = {
  before: {
    all: [
      when(
        hook => hook.params.provider && `/${hook.path}` !== "/authentication",
        authenticate,
        authorize()
      )
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
