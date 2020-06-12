const better = require('better-sqlite3')
const csv = require('csv');
const parse = require('csv-parse/lib/sync');
const fs = require('fs').promises;

const taskdb = better('./tasks.db');
const cbdb = better('./cbdb.db');

async function extractTask(id) {
    q = "select data from tasks where id=" + id;
    dt = taskdb.prepare(q).all();
    t = JSON.parse(dt[dt.length - 1]["data"]);
    console.log(t);

    var dt;
    if (t.src_type === "json") {
        dt = t.src_data;
    } else if (t.src_tye === "db_table") {
        q = await constructQuery(t);
        console.log(q);
        dt = cbdb.prepare(q).all();
    } else if (t.src_type === "csv_file" ) {
        const content = await fs.readFile(t.src_data);
        const records = parse(content);
        autofillFields(t, records);
        dt = records;
    }
    return t;
    
}

// Generate missing fields meta-data, guess field type based on data,
// and fill in the fields into the task definition.
// This requires the first row of the data to be field_name (like in csv file).
async function autofillFields(task, data) {
    const fields = task.fields;
    const df_names = data[0];

    for (var i = 0; i < df_names.length; i++) {        
        if (fields.hasOwnProperty(df_names[i])) {
            continue;
        }
        f = {
            field_name: df_names[i],
            name: df_names[i],
            type: "string"
        }

        var input = false;
        // Run thru data to see if any empty data
        for (var j = 1; j < data.length; j++) {
            if (data[j][i] === "") {
                input = true;
                break;
            }
        }
        f.input = input;
        fields[df_names[i]] = f;
    }
}


async function constructQuery(task) {
    const fields = task.fields;
    const field_map = task.src_data.field_map;

    console.log(field_map);
    var q = "select ";
    for (var i = 0; i < fields.length; i++) {
        if (i > 0) {
            q += ",";
        }
        const name = fields[i].field_name;
        console.log("on ... " + name);
        if (field_map.hasOwnProperty(name)) {
            console.log("has property: " + name);
            var f = field_map[name];
            if (f.type === "direct") {
                q += f.c_field_name;
            } else if (f.type === "join") {
                console.log("join type");
                j = field_map[name];
                q += "(select " + j.fc_field_name + " from " + j.fc_table_name + " where " +
                    j.fc_table_name + "." + j.fc_fk + "=" + j.fc_pk + ") as " + j.fc_field_name;
            }
        } else {
            q += name;
        }

    }

    q += " from " + task.src_data.c_table_name;

    const filters = task.src_data.filters;
    if (filters) {
        q += " where ";
        for (var i = 0; filters && i < filters.length; i++) {
            if (i > 0)
                q += filters[i].condition + " ";
            q += filters[i].c_field_name + filters[i].c_field_value + " ";
        }

    }


    return q;
}
