const better = require('better-sqlite3')
const cbdb = better('./data/cbdb.db');

const hooks = require('./tasks.hooks.js')
const taskdb = better('./data/tasks.db');
const { BadRequest } = require('@feathersjs/errors');


class ProposalService {
    constructor() {

    }


    async byTaskId(tid) {
        console.log("Proposal service: by task id");
        var q = "select * from proposals where task_id=" + tid;
        var dt = taskdb.prepare(q).all();
        if (dt.length == 0) {
            return [];
        }
        const t = (await new TaskService().get(tid));
        const pkField = t.pkField;
        const fieldDef = t.fields[pkField];

        dt.forEach((p) => {
            p.data = JSON.parse(p.data);
            p.data = this._uniqueValues(p.data, pkField, fieldDef);
        })


        return dt;

    }


    _isUnique(arr, item, fieldDef) {
        // console.log(" +++++++++");
        // console.log(fieldDef.type);
        if (fieldDef.type === "person") {
            // console.log("Existing array:: " + JSON.stringify(arr));
            // console.log("item:  " + JSON.stringify(item));


            var b = true;
            arr.forEach(a => {
                if (a.c_personid && item.c_personid) {
                    if (a.c_personid === item.c_personid) {
                        // console.log("not unique")
                        b = false;
                    }
                } else {
                    if (a.c_name_chn === item.c_name_chn) {
                        // console.log("not unique")
                        b = false;
                    }
                }
            })
            // console.log("unique: " + b)
            return b;
        } else {
            return (!arr.includes(item));
        }

    }


    _uniqueValues(data, pkField, fieldDef) {
        const values = {};
        const uniques = [];
        for (var i = 0; i < data.length; i++) {
            const pk = data[i][pkField];
            const keys = Object.keys(data[i]);
            const uniqRow = {};
            // console.log(data[i]);
            keys.forEach((key) => {
                // console.log("key ... ");
                // console.log(data[i][key]);
                if (!values[pk]) values[pk] = {};
                if (!values[pk][key]) values[pk][key] = [];
                if (this._isUnique(values[pk][key], data[i][key], fieldDef)) {
                    uniqRow[key] = data[i][key];
                    values[pk][key].push(data[i][key]);
                }

            })
            uniques.push(uniqRow);
        }

        return uniques;
    }

    async get(id) {
        console.log("Proposal service get =" + id)
        const q = "select * from proposals where id=" + id;
        const st = taskdb.prepare(q);
        const p = st.all()[0];
        p.data = JSON.parse(p.data);
        console.log(p.data);

        const t = (await new TaskService().get(proposal.task_id));
        const pkField = t.pkField;
        const fieldDef = t.fields[pkField];
        console.log(t.fields);
        p.data = this._uniqueValues(p.data, pkField, fieldDef);
        return p;
    }

    /* 
    * Create new proposal
    * Requires proposal.{task_id, values, author}
    * 
    */
    async create(proposal, params) {
        console.log(proposal);
        if (!proposal.hasOwnProperty("task_id") || !proposal.hasOwnProperty("data") || !proposal.hasOwnProperty("author")) {
            const error = "Error creating new proposal: missing task_id, data, or author";
            console.log(error);
            return Promise.reject(new BadRequest(error));
        }
        try {
            // await this.validateProposal(proposal)
            const created = new Date();
            const q = "insert into proposals(task_id, author, lastupdate, data) values(@task_id,@author,date('now'), json(@data));"
            const st = taskdb.prepare(q);
            const r = st.run({ task_id: proposal.task_id, author: proposal.author, data: JSON.stringify(proposal.data) });
            console.log(r);
            console.log("Inserted proposal");

            const b = (await new TaskService().get(proposal.task_id));
            const pkField = b.pkField;

            const props = proposal.data;
            for (var i = 0; i < props.length; i++) {
                console.log("Pk: " + props[i][pkField]);
                await new TaskService().markPending(proposal.task_id, props[i][pkField]);
                console.log("Task item marked as pending.");
            }
        } catch (e) {

            console.log(e);
            return Promise.reject(e);
        }
    }




    async _valProposalField(def, value) {
        const type = def.type;
        console.log(" - Validating field ... " + def.field_name + " @" + type);
        if (type == "number" && isNaN(value)) {
            throw new Error("Field " + def.field_name + "'s value not a number: " + value);
        } else if (type == "int" && (isNaN(value) || !Number.parseInt(value))) {
            throw new Error("Field " + def.field_name + "'s value not an int: " + value);
        }

        const validators = ProposalService._validators[type];
        for (var i = 0; validators && i < validators.length; i++) {
            console.log(" + validator: " + validators[i]);
            const v = validators[i];
            if (v.type == "in_json" && !(v.includes(value))) {
                throw new Error("Field " + def.field_name + "'s value does not match enumerator list");
            }
            else if (v.type == "in_table") {
                console.log("permissible in table ... ");
                const condition = " where " + v.table_field + "=" + value[v.attribute];
                const q = "select * from " + v.table_name + condition;
                console.log(q);
                const dt = cbdb.prepare(q).all();
                if (dt.length == 0) {
                    console.log("Field value not found in specified table")
                    throw new Error("Field value not found in specified table");
                }
            }
        }

    }

    async validateProposal(p) {
        var tid = p.task_id;
        var task = await new TaskService().get(tid);
        var tfs = task.fields;
        var pfs = p.data;
        for (var j = 0; j < pfs.length; j++) {
            var pf = pfs[j];
            var fields = Object.entries(pfs[j]);
            for (var z = 0; z < fields.length; z++) {
                var field = fields[z][0];
                var value = fields[z][1];
                if (!tfs.hasOwnProperty(field)) {
                    throw new Error("Proposal field not found in original task: " + field)
                }
                await this._valProposalField(tfs[field], value);
            }
        }
    }

    static _validators = {
        "person": [{
            attribute: "c_personid",
            operator: "and",
            type: "in_table",
            table_name: "biog_main",
            table_field: "c_personid"
        }

        ],
        "string": [],
        "int": [],
        "number": [],
    }

}
module.exports.ProposalService = ProposalService;