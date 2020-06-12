var elasticsearch = require('elasticsearch');
var better = require('better-sqlite3')
var client = new elasticsearch.Client({
    hosts: [
        'http://@localhost:9200/'
    ]
});

async function deleteIndex() {
    try {
        resp = await client.indices.delete({
            index: 'cbdb'
        });
        console.log("Index deleted:" + resp);
    } catch (e) {
        console.log(e);
    }

}

async function createIndex() {
    try {
        resp = await client.indices.create({
            index: 'cbdb',
            // body: {
            //     mappings: {
            //         properties: {
            //             status_data: {
            //                 type: "nested",
            //                 properties: {
            //                     key: {type: "text"}
            //                 }
            //             }
            //         }
            //     }
            // }
        });
        console.log("Index created:");
        console.log(resp);
    } catch (e) {
        console.log(e);
    }
}

// const sqlite3 = require('sqlite3').verbose();
// connSqlite();
const db = better('./cbdb.db');
function connSqlite() {
    // db = new sqlite3.Database('/Users/tomding/code/cbdbapp/cbdb.db', sqlite3.OPEN_READONLY, (err) => {
    //     if (err) {
    //         console.log(err);
    //         return console.error(err.message);
    //     }
    //     console.log('Connected to the cbdb SQlite database.');
    // });

}


async function importAll() {

    const limit = 50000;
    ppl_query = "select * from biog_main limit " + limit;
    status_query = "select sd.*,sc.c_status_desc,sc.c_status_desc_chn \
            from status_data as sd \
            inner join status_codes as sc \
            on sd.c_status_code = sc.c_status_code \
            order by sd.c_personid\
            ";
    assoc_query = "select * from assoc_data as ad\
    join assoc_codes as ac  on ad.c_assoc_code= ac.c_assoc_code\
    order by ad.c_personid \
    ";
    people = [];

    dataFinder = { find: function (data, personid) {
        if (!this._pointer) {
            this._pointer = 0;
        }
        arr = [];
        while (this._pointer < data.length
            && data[this._pointer].c_personid < personid) {
            this._pointer++;
        }
        while (this._pointer < data.length
            && data[this._pointer].c_personid == personid) {
            // console.log("Pushing ... ");
            // console.log(data[_pointer]);
            arr.push(data[this._pointer]);
            this._pointer++;
        }
        if (arr.length == 0) {
            // console.log(" * No data found ||  " + this._pointer + ": " + (this._pointer < data.length?data[this._pointer].c_personid:""));
        } else {
            // console.log("  * entries: " + arr.length + " || " + this._pointer + ": " + (this._pointer < data.length?data[this._pointer].c_personid:""));
        }
        return arr;
    } }

    statusFinder = Object.create(dataFinder)
    assocFinder = Object.create(dataFinder);
    console.log(statusFinder);

    const status_data = db.prepare(status_query).all();
    console.log("Size of status: " + status_data.length)

    const assoc_data = db.prepare(assoc_query).all();
    console.log("Size of assoc: " + assoc_data.length)

    const rows = db.prepare(ppl_query).all();
    console.log("Size of ppl: " + rows.length)
    const flush_size = 100;
    try {
        var i = 0;
        for (const row of rows) {
            console.log(" - #" + i + " -");
            console.log("  = assoc ");
            row.assoc_data = assocFinder.find(assoc_data, row.c_personid)
            console.log("  = status ");
            row.status_data = statusFinder.find(status_data, row.c_personid)
            // row.status_data = [{key1:"1A",key2:"1B"}, {key1:"2A",key2:"group2B"}];
            // console.log(row);
            people.push({ index: { _index: 'cbdb', _type: 'biog' } });
            people.push(row);
            i++;
	    if (i % flush_size == 0) {
		console.log("Attempt to flush ...");
		resp = await client.bulk({ body: people });
		people = [];
		console.log("Flushed: " + flush_size);
	    }
        }
	if (people.length > 0)
        	resp = await client.bulk({ body: people });
        if (resp.errors && resp.items[0]) {
            for (r of resp.items) {
                console.log(r.index);
            }
        }
        console.log(people.length / 2 + " row(s) added.");
        // await search("wei");
    } catch (e) {
        console.log(e);
    }


}

async function search(q) {
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
    // perform the actual search passing in the index, the search query and the type
    await client.search({ index: 'cbdb', body: body, type: 'biog' })
        .then(results => {
            console.log("-- results --");
            // console.log(results.hits.hits)
            // console.log(results.hits);
            results.hits.hits.forEach(r => {
                // console.log(JSON.stringify(r._source));
                // console.log(r._score + " | " + r._source.c_name_chn);
                console.log(r.highlight);
            });

        })
        .catch(err => {
            console.log(err)
        });
}
async function main() {

    await deleteIndex();
    await createIndex();
    await importAll();
}
main();
// search("宋");
