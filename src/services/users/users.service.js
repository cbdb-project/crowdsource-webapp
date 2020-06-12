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

  userDb.schema.dropTableIfExists('users').createTable('users', function (table) {
    table.increments('id');
    table.string('email');
    table.string('password');
    table.string('nickname');
    table.timestamps('created');
  }).then(() => console.log("table created"))
  .catch((err) => { console.log(err); throw err })
  .finally(() => {
      // knex.destroy();
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