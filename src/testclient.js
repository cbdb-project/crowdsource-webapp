const SERVER = 'http://localhost:5001';
const io = require('socket.io-client')(SERVER, { origins: ['csa.cbdb.fas.harvard.edu:81']});
const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio-client');

// const socket = io('http://localhost:5000');
const client = feathers();

client.configure(socketio(io));

const tasks = client.service('tasks');

(async() => {
    t = await tasks.get(1);
    console.log(t);
})();
