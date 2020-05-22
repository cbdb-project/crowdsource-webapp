const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./cbdb.db', sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.log(err);
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});


app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.post('/api/world', (req, res) => {
  console.log(req.body);
  res.send(
    `I received your POST request. This is what you sent me: ${req.body.post}`,
  );
});


app.get('/api/search',async (req, res) => {
  try {
    r = await search(req.query.q);
    res.send(r);
  } catch (e) {
    console.log(e);
    res.send(null);
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));


var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
    hosts: [
        'http://@localhost:9200/'
    ]
});

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
