const io = require('socket.io-client');

const feathers = require('@feathersjs/feathers')
const auth = require('@feathersjs/authentication-client');

const socketio = require('@feathersjs/socketio-client');

const client = feathers()

const socket = io('http://' + location.hostname + ':5000');

(async () => {
    client.configure(socketio(socket));

    client.configure(auth({
        storageKey: 'auth'
    }))

    const { accessToken } = await client.authenticate({
        strategy: 'local',
        email: 'd@lei.je',
        password: '123456'
    })

    // console.log(accessToken);
    // console.log('Authenticated!');

    u = await client.service('users').get(1)
    console.log(u);

})();

