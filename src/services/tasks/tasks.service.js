const better = require('better-sqlite3')
const cbdb = better('./cbdb.db');

const hooks = require('./tasks.hooks.js')
const taskdb = better('./tasks.db');

module.exports = function tasks(app) {
    app.use('/tasks', new TaskService())
    app.service('tasks').hooks(hooks)
    console.log("hooks installed for tasks.")
}

class TaskService {

    constructor() {
    }

    async create(data) {
    }

    async get(id, params) {
        try {
            console.log("Task service: get");
            var q = "select data from tasks where id=" + id;
            var dt = taskdb.prepare(q).all();
            if (dt.length == 0) {
                return [];
            }
            const task = JSON.parse(dt[0].data);

            if (!params || !params.query || !params.query.hasOwnProperty("proposals") || params.query.proposals.split(",").length == 0) {
                return task;
            }

            const fields = Object.entries(task.fields);
            // Find the primary key
            var pkField;
            for (var i = 0; i < fields.length; i++) {
                // console.log(" ++ " + fields[i][1].type);
                if (fields[i][1].type === "key") {
                    pkField = fields[i][0];
                }
            }
            console.log("pk name = " + pkField);

            var ps = params.query.proposals.split(",");

            task.proposals = {};

            // Merge with all proposal values 
            for (var i = 0; i < ps.length; i++) {
                const propItems = (await new ProposalService().get(parseInt(ps[i]))).data;
                // console.log(proposal);
                // propItems = Object.entries(proposal.fields);
                for (var k = 0; k < propItems.length; k++) {
                    const pkVal = propItems[k][pkField];
                    console.log("pk val = " + pkVal);
                    if (!task.proposals[pkVal]) {
                        task.proposals[pkVal] = [];
                    }
                    task.proposals[pkVal].push(propItems[k]);
                }
            }
            console.log(" === Get === with proposals merged ===");
            console.log(JSON.stringify(task));
            console.log(" === end === ");
            return task;


        } catch (e) {
            console.log(e);
        }

    }
    async find() {
        try {
            var q = "select data from tasks"
            var dt = taskdb.prepare(q).all();
            var list = [];
            for (var i = 0; i < dt.length; i++)
                list.push(JSON.parse(dt[dt.length - 1]["data"]));
            return list;
        } catch (e) {
            console.log(e);
        }
    }
}

class ProposalService {
    constructor() {

    }

    async get(id) {
        console.log("Proposal service get =" + id)
        const q = "select * from proposals where id=" + id;
        const st = taskdb.prepare(q);
        const p = st.all()[0];
        p.data = JSON.parse(p.data);
        console.log(p);
        return p;
    }

    /* 
    * Create new proposal
    * Requires proposal.{task_id, values, author}
    * 
    */
    async create(proposal, params) {
        console.log(params);
        if (!proposal.hasOwnProperty("task_id") || !proposal.hasOwnProperty("data") || !proposal.hasOwnProperty("author")) {
            const error = "Error creating new proposal: missing task_id, data, or author";
            console.log(error);
            return Promise.reject(new BadRequest(error));
        }
        try {
            await this.validateProposal(proposal)
            const created = new Date();
            const q = "insert into proposals(task_id, author, lastupdate, data) values(@task_id,@author,date('now'), json(@data));"
            const st = taskdb.prepare(q);
            const r = st.run({ task_id: proposal.task_id, author: proposal.author, data: JSON.stringify(proposal.data) });
            console.log("Size of status: " + r)
        } catch (e) {
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
                const condition = " where " + v.table_field + "=" + value;
                const q = "select * from " + v.table_name + condition;
                console.log(q);
                const dt = cbdb.prepare(q).all();
                if (dt.length == 0) {
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


