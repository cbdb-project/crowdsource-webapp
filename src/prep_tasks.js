const elasticsearch = require('elasticsearch');
const better = require('better-sqlite3')
const csv = require('csv');
const parse = require('csv-parse/lib/sync');
const fs = require('fs').promises;


// const sqlite3 = require('sqlite3').verbose();
// connSqlite();
const taskdb = better('./tasks.db');
const cbdb = better('./cbdb.db');

async function dropTasks() {
    q = "drop table tasks";
    st = taskdb.prepare(q);
    r = st.run();
    console.log("Size of status: " + r)
}

async function dropProposals() {
    s = "drop table proposals";
    st = taskdb.prepare(s);
    r = st.run();
    console.log("Result of create proposals: " + r)
}


async function createProposals() {
    s = "create table proposals ( \
        id INTEGER PRIMARY KEY autoincrement, task_id INTEGER, author INTEGER, lastupdate DATETIME, data json);"
    st = taskdb.prepare(s);
    r = st.run();
    console.log("Result of create proposals: " + r)
}
async function createTasks() {
    create_tasks = "create table tasks ( \
        id INTEGER PRIMARY KEY autoincrement, data json);"
    st = taskdb.prepare(create_tasks);
    r = st.run();
    // console.log("Result of create tasks: " + r)
}

async function constructQuery(task) {
    const fields = task.fields;
    const field_map = task.data.field_map;

    // console.log(field_map);
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

    q += " from " + task.data.c_table_name;

    const filters = task.data.filters;
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

async function getTask(id) {

    q = "select data from tasks where id=" + id + "";
    dt = taskdb.prepare(q).all();
    t = JSON.parse(dt[dt.length - 1]["data"]);
    return t;
}


async function _valTask(task, data) {

}

const FIELD_TYPES = ["key","person", "","key","int", "number", "string"]

// Generate missing fields meta-data, guess field type based on data,
// and fill in the fields into the task definition.
// This requires the first row of the data to be field_name (like in csv file).
async function autofillFields(task, data) {
    const fields = task.fields;
    const df_names = data[0];
    const df_fnames = data[1];

    for (var i = 0; i < df_names.length; i++) {
        if (fields.hasOwnProperty(df_names[i])) {
            continue;
        }
        fname = df_names[i];

        input = false;
        type = "string"
        if (df_names[i].includes("=")) {
            s = fname.split("=");
            fname = s[0]
            type = s[1]
            if (type !== "key") 
                input = true;
            
        }

        if (!FIELD_TYPES.includes(type)) {
            throw new Error("Field " + fname + "'s type " + type + " is not a valid one.");
        }

        f = {
            field_name: fname,
            name: df_fnames[i],
            type: type
        }

        // Run thru data to see if any empty data
        for (var j = 1; input === false && j < data.length; j++) {
            if (data[j][i] === "") {
                input = true;
                break;
            }
        }
        f.input = input;
        fields[fname] = f;
    }
}


// Fill the task
async function fillTaskByCsv(task, csvfile, header = true) {
    const content = await fs.readFile(csvfile);
    const records = parse(content);
    autofillFields(task, records);
    if (header) {
        records.shift();
        records.shift();
    }
        
    var recMap = {};
    var pkName;
    var pkIndex = 0;
    // console.log(JSON.stringify(task);)
    const fields = Object.entries(task.fields);
    for (var i = 0;i < fields.length; i++) {
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

async function extractTasks() {
    q = "select data from tasks"
    dt = taskdb.prepare(q).all();
    t = JSON.parse(dt[dt.length - 1]["data"]);
    // console.log(t);

    var dt;
    if (t.src_type === "json") {
        dt = t.data;
    }
    if (t.src_type === "db_table") {
        q = await constructQuery(t);
        // console.log(q);
        dt = cbdb.prepare(q).all();
    }
    if (t.src_type === "csv_file") {
        const content = await fs.readFile(t.data);
        const records = parse(content);
        autofillFields(t, records);
        dt = records;
    }
    // console.log(t.fields);
    // for (var i = 0; i < dt.length; i++) {
    //     console.log(dt[i]);
    // }
    // console.log(q)
}

async function addProposals() {
    p = {};
    p = {
        task_id: 1,
        evidence: "My research ...",
        author: 1,
        created: new Date()
    }
    p.fields =
    {
        "c_assoc_id": 3822,
    }

    q = "insert into proposals(data) values(json(@data));"
    st = taskdb.prepare(q);
    r = st.run({ data: JSON.stringify(p) });
    console.log("Size of status: " + r)
}


async function _valProposalField(def, value) {
    type = def.type;
    if (type == "number" && isNaN(value)) {
        throw new Error("Field " + def.field_name + "'s value not a number: " + value);
    } else if (type == "int" && (isNaN(value) || !Number.parseInt(value))) {
        throw new Error("Field " + def.field_name + "'s value not an int: " + value);
    }

    validators = def.validators
    for (var i = 0; validators && i < validators.length; i++) {
        v = validators[i];
        if (v.type == "in_json" && !(v.includes(value))) {
            throw new Error("Field " + def.field_name + "'s value does not match enumerator list");
        }
        else if (v.type == "in_table") {
            // console.log("permissible in table ... ");
            fields = "";
            def.data.fields.map((v) => {
                if (fields.length > 0)
                    fields += ","
                fields += v;
            });
            q = "select " + v + " from " + def.in_table_name;
            // console.log(q);
            dt = cbdb.prepare(q).all();
            if (dt.length == 0) {
                throw new Error("Field value not found in specified table");
            }
        }
    }
    // Check if exists in specified table

}

async function validateProposals() {
    q = "select data from proposals"
    props = taskdb.prepare(q).all();
    for (var i = 0; i < props.length; i++) {
        p = JSON.parse(props[i].data);
        // console.log(p);
        tid = p.task_id;
        task = await getTask(tid);
        // console.log(task);
        tfs = task.fields;
        pfs = p.fields;
        for (var j = 0; j < pfs.length; j++) {
            pf = pfs[j];
            if (!tfs.hasOwnProperty(pfs[i])) {
                throw new Error("Field not found in original task: " + pf.field_name)
            }
            // console.log(pf);
            // console.log(def);
            _valProposalField(def, pf.value)
        }

    }
}

async function addTasks() {
    t = {};
    t.title = "Identify authors of correspondences with 张邦奇 ";
    t.type = "revise";
    t.fields = {}
    // {
    //     name: "Assoc id",
    //     input: false,
    //     field_name: "assoc_id",
    //     type: "int",
    // },
    // {
    //     name: "Letter title",
    //     input: false,
    //     field_name: "title",
    //     type: "string",
    // },
    // {
    //     name: "Source",
    //     input: false,
    //     field_name: "source",
    //     type: "string",
    // },
    // {
    //     name: "Pages",
    //     field_name: "pages",
    //     input: false,
    //     type: "string",

    // },
    // {
    //     name: "Recepient Id",
    //     field_name: "c_assoc_id",
    //     input: false,
    //     type: "int",
    // },
    // {
    //     name: "Recepient Name",
    //     field_name: "person_name",
    //     input: true,
    //     type: "string",
    //     // validators: [{
    //     //     operator: "and",
    //     //     type: "in_table",
    //     //     data: {
    //     //         c_table_name:"biog_main",
    //     //         c_table_field:"c_personid"
    //     //     }
    //     // }]
    // }

    t.src_type = "json_data"
    // t.data = "data/all-letters.csv"

    await fillTaskByCsv(t, "data/all-letters.csv")
    console.log('task filled ...')
    console.log(t);

    t.status = "open";
    t.created = new Date();
    q = "insert into tasks(data) values(json(@data));"
    st = taskdb.prepare(q);
    r = st.run({ data: JSON.stringify(t) });
    // console.log("Size of status: " + r)
}

async function main() {
    await dropTasks();
    await createTasks();
    await addTasks();
    await extractTasks();
    await dropProposals();
    await createProposals();
    await addProposals();
    await validateProposals();
}
main();

//////////////////////////////
    // t.data = {
    //     c_table_name: "assoc_data",
    //     field_map: {
    //         "assoc_id": {
    //             type: "direct",
    //             c_field_name: "c_assoc_id"
    //         },
    //         "title": {
    //             type: "direct",
    //             c_field_name: "c_text_title"
    //         },
    //         "source": {
    //             type: "direct",
    //             c_field_name: "c_source"
    //         },
    //         "pages": {
    //             type: "direct",
    //             c_field_name: "c_pages"
    //         },
    //         "person_name": {
    //             type: "join",
    //             fc_table_name: "biog_main",
    //             fc_fk: "c_personid",
    //             fc_pk: "c_assoc_id",
    //             fc_field_name: "c_name",

    //         }
    //     },
    //     filters: [
    //         {
    //             condition: "and",
    //             c_field_name: "c_assoc_code",
    //             c_field_value: "=437"
    //         },
    //         {
    //             condition: "and",
    //             c_field_name: "c_personid",
    //             c_field_value: "=28825"
    //         }
    //     ],
    // }