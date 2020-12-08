const io = require('socket.io-client')(server, { origins: '*:*'});
const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio-client');

const socket = io('http://localhost:5000');
const client = feathers();

client.configure(socketio(socket));

const tasks = client.service('tasks');

(async() => {
    t = await tasks.get(1);
    console.log(t);
})();
