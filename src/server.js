// const proposals = require( './services/tasks/proposals.service')
const better = require('better-sqlite3')
const multer = require('multer')
const ImportTask = require('./import.js');
const importer = new ImportTask();
const taskdb = better('./tasks.db');
const cbdb = better('./cbdb.db');

const feathers = require('@feathersjs/feathers')
const express = require('@feathersjs/express')
const socketio = require('@feathersjs/socketio');
const cors = require('cors')

const { NotFound, GeneralError, BadRequest } = require('@feathersjs/errors');

const path = require('path');

const fs = require('fs');
let port_number = ""
try {
  const config_data = fs.readFileSync('src/config.js', 'utf8').toString();
  const port_number_reg = /const port_number = "(\d+)"/g;
  port_number = port_number_reg.exec(config_data);
      
} catch(e) {
  console.log('Error:', e.stack);
}
const port = process.env.PORT || parseInt(port_number[1]);
process.env['NODE_CONFIG_DIR'] = path.join(__dirname, '../config/')
const configuration = require('@feathersjs/configuration')
const fe = feathers()
const appHooks = require('./services/services.hooks');

const app = express(fe)
app.configure(configuration())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.errorHandler());
app.use(cors());

// Socket binding
app.configure(socketio());
app.configure(express.rest());

app.hooks(appHooks);
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Auth service */
const auth = require('./auth')
app.configure(auth)

const person = require('./services/person/person.service')
app.configure(person);

const tasks = require('./services/tasks/tasks.service')
app.configure(tasks);

const users = require('./services/users/users.service');
users(app);

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '.')
  },
  filename: function (req, file, cb) {
    cb(null, "newtask.csv")
  }
})
var upload = multer({ storage: storage }).single('file')

app.post('/import', function (req, res) {
  console.log(":: Task Import service: " + req.query.title);
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.log(err);
      return res.status(500).json(err)
    } else if (err) {
      console.log(err);
      return res.status(500).json(err)
    }

    console.log(req.query);
    importer.import(req.query.title, "./newtask.csv")

    return res.status(200).send("Success!")

  })
});

// Start the server
app.listen(port).on('listening', () =>
  console.log('CBDB Crowdsource server listening on port:' + port)
);