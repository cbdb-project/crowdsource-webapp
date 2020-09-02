const elasticsearch = require('elasticsearch');
const better = require('better-sqlite3')
const csv = require('csv');
const parse = require('csv-parse/lib/sync');
const fs = require('fs').promises;
const knex = require('knex');
const taskdb = better('./tasks.db');


// const sqlite3 = require('sqlite3').verbose();
// connSqlite();

const FIELD_TYPES = ["key", "person", "", "key", "int", "number", "string"]

class ImportTask {
    async import(title, csvPath ) {
        const t = {};
        t.title = title;
        t.type = "revise";
        t.fields = {}
        t.edited = {};
        t.finalized = {};
        t.src_type = "json_data"

        await this.fillTaskByCsv(t, csvPath)
        console.log('task filled ...')
        // console.log(t);

        var q = "insert into tasks(author,data,lastupdate) values(@author, json(@data), @lastupdate);"
        var st = taskdb.prepare(q);
        var r = st.run({ author: 1, lastupdate: new Date().toString(), data: JSON.stringify(t) });

    }


    // Fill the task
    async fillTaskByCsv(task, csvfile, header = true) {
        const content = await fs.readFile(csvfile);
        const records = parse(content);
        this.autofillFields(task, records);
        if (header) {
            records.shift();
            records.shift();
        }

        var recMap = {};
        var pkName;
        var pkIndex = 0;
        // console.log(JSON.stringify(task);)
        const fields = Object.entries(task.fields);
        for (var i = 0; i < fields.length; i++) {
            if (fields[i][1].type === "key") {
                pkName = fields[i][1].field_name;
                pkIndex = i;
            }
        }
        console.log("pk =" + pkName);
        records.map((v, i) => {
            recMap[v[pkIndex]] = v;
            delete recMap[v[pkIndex]].pkName
        });
        task.data = recMap;
    }

    // Generate missing fields meta-data, guess field type based on data,
    // and fill in the fields into the task definition.
    // This requires the first row of the data to be field_name (like in csv file).
    async autofillFields(task, data) {
        const fields = task.fields;

        // field identifiers
        const df_names = data[0];

        // friendly field names
        const df_fnames = data[1];

        for (var i = 0; i < df_names.length; i++) {
            if (fields.hasOwnProperty(df_names[i])) {
                continue;
            }
            var fname = df_names[i];

            var input = false;
            var type = "string"
            if (df_names[i].includes("=")) {
                var s = fname.split("=");
                var fname = s[0]
                var type = s[1]
                if (type !== "key")
                    input = true;
            }

            if (!FIELD_TYPES.includes(type)) {
                throw new Error("Field " + fname + "'s type " + type + " is not a valid one.");
            }

            var f = {
                field_name: fname,
                col: i,
                name: df_fnames[i],
                type: type
            }

            // Run thru data to see if any empty data
            // for (var j = 1; input === false && j < data.length; j++) {
            //     if (data[j][i] === "") {
            //         input = true;
            //         break;
            //     }
            // }
            f.input = input;
            fields[fname] = f;
        }
    }
}

module.exports = ImportTask;