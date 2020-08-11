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
const users = require('./services/users/users.service');

const port = process.env.PORT || 5000;
process.env['NODE_CONFIG_DIR'] = path.join(__dirname, '../config/')
const configuration = require('@feathersjs/configuration')
const fe = feathers()

const app = express(fe)
app.configure(configuration())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.errorHandler());
app.use(cors());


// Socket binding
app.configure(socketio());
app.configure(express.rest());

// Auth service */
const auth = require('./auth')
app.configure(auth)

const person = require('./services/person/person.service')
app.configure(person);

const tasks = require('./services/tasks/tasks.service')
app.configure(tasks);

// app.configure(tasks)

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

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
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err)
    } else if (err) {
      return res.status(500).json(err)
    }

    importer.import("title test", "./newtask.csv")

    return res.status(200).send(req.file)

  })
});

app.use('/people', {
  async find(params) {
    try {
      console.log(params.query.q);
      r = await search(params.query.q)
      return r;
    } catch (e) {
      console.log(e);

    }
  }
});


// app.use("/proposals", new ProposalService());
// app.use("/tasks_data", new TaskDataService());

// Start the server
app.listen(port).on('listening', () =>
  console.log('Feathers server listening on port:' + port)
);

var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  hosts: [
    'http://@localhost:9200/'
  ]
});

async function search_name(q) {

}
async function search(q) {
  console.log(q);
  let body = {
    size: 200,
    from: 0,
    query: {
      "simple_query_string": {
        "query": q,
        // "field": "*",
        "default_operator": "and"
      }
      // match: {
      // c_name: "*"
      // }
    },
    "highlight": {
      "require_field_match": false,
      "fields": {
        "*": { "pre_tags": ["<em>"], "post_tags": ["</em>"] }
      }
    }
  }
  items = [];
  // perform the actual search passing in the index, the search query and the type
  await client.search({ index: 'cbdb', body: body, type: 'biog' })
    .then(results => {

      // console.log(results.hits.hits)
      // console.log(results.hits);
      results.hits.hits.forEach(r => {
        let i = r._source;
        i._highlights = r.highlight;
        items.push(i);
      });
    })
    .catch(err => {
      console.log(err)
    });
  return items;
}