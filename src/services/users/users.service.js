const { Service } = require('feathers-knex')
const hooks = require('./users.hooks')
const knex = require('knex');
const {defineAbilitiesFor} = require("../hooks/abilities.js");
const { Ability, ForcedSubject, AbilityBuilder } = require('@casl/ability');
const { Forbidden } = require('@feathersjs/errors')
const { packRules } = require('@casl/ability/extra')



module.exports = function users(app) {

  const userDb = knex({
    client: 'sqlite3',
    connection: {
      filename: './data/user.db'
    }
  });

  const options = {
    name: 'users',
    Model: userDb,
    paginate: app.get('pagination')
  }

  console.log("/users created");
  const userSvc = new UserService(options)
  app.use('/users', userSvc)

  app.service('users').hooks(hooks)

  app.use('/abilities', new AbilityService(userSvc))
}

class UserService extends Service {
  constructor(options) {
    console.log("UserService constructor");
    // console.log(options);
    super(options);
  }
  async create(user) {
    console.log("userservice: create() ");
    console.log(user);
    var e = await super.find({
      query: {email: user.email}});
    console.log(e);
    if (e.length > 0) {
      console.log("Already exists email! " + user.email);
      
      throw new Error("User already exists!");
    }
    const c = await super.create(
      {
      email: user.email,
      password: user.password,
      role: "contributor"
      }
        )  
    return c;
  }

}


class AbilityService {
  constructor(userService) {
    this.userService = userService;
  }


  async get(id) {
    const user = await this.userService.get(id)
    console.log(user);
    var abilities = await defineAbilitiesFor(user);
    console.log(" Can task? " + abilities.can("get", "tasks"))
    const packedRules = packRules(abilities.rules)
    console.log(packedRules);

    return packedRules;
  }
}