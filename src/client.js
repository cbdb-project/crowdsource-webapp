const io = require('socket.io-client');

const feathers = require('@feathersjs/feathers')
const auth = require('@feathersjs/authentication-client');

const socketio = require('@feathersjs/socketio-client');

const client = feathers()

const socket = io('http://localhost:5000');

(async () => {
    client.configure(socketio(socket));

    client.configure(auth({
        storageKey: 'auth'
    }))

    const { accessToken } = await client.authenticate({
        strategy: 'local',
        email: 'chad',
        password: 'admin'
    })

    // console.log(accessToken);
    // console.log('Authenticated!');

    u = await client.service('tasks').update(1,{})
    console.log(u);

})();

