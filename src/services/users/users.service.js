const { Service } = require('feathers-knex')
const hooks = require('./users.hooks')
const knex = require('knex');

module.exports = function users(app) {

  const userDb = knex({
    client: 'sqlite3',
    connection: {
      filename: './user.db'
    }
  });


  const options = {
    name: 'users',
    Model: userDb,
    paginate: app.get('pagination')
  }

  console.log("/users created");
  app.use('/users', new Service(options))

  app.service('users').hooks(hooks)
}