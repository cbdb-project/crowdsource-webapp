const SERVER = 'http://localhost:5001';
const io = require('socket.io-client')(SERVER, { origins: ['*:*']});

const feathers = require('@feathersjs/feathers')
const auth = require('@feathersjs/authentication-client');

const socketio = require('@feathersjs/socketio-client');

const client = feathers()

// const socket = io('http://localhost:5000');
const {Ability} =require('@casl/ability');
const {unpackRules} =require('@casl/ability/extra');

(async () => {
    client.configure(socketio(io));

    client.configure(auth({
        storageKey: 'auth'
    }))

    const user = await client.authenticate({
        strategy: 'local',
        email: 'chad',
        password: 'admin'
    })
    

    // console.log(user);
    // console.log('Authenticated!');

    // u = await client.service('tasks').update(1,{})
    const packedRules = await client.service('abilities').get(user.user.id)
    const userAbility = new Ability()
    userAbility.update(unpackRules(packedRules))
    console.log("Can read tasks?" + userAbility.can("get", "tasks"));
    console.log("Can delete tasks?" + userAbility.can("delete", "tasks"));
})();

