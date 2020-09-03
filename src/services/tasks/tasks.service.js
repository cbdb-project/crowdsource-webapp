const better = require('better-sqlite3')
const cbdb = better('./data/cbdb.db');

const hooks = require('./tasks.hooks.js')
const taskdb = better('./data/tasks.db');
const { BadRequest } = require('@feathersjs/errors');



module.exports = function tasks(app) {
    app.use('/tasks', new TaskService())
    app.service('tasks').hooks(hooks)
    console.log("hooks installed for tasks.")
    app.use('/proposals', new ProposalService())
    console.log("loaded proposal service.")
}

class TaskService {

    constructor() {
        // super();
    }

    async create(data) {
    }

    _paginate(data, page, perPage, target) {
        page -= 1;
        if (page < 0) {
            page = 0;
        }
        var start = page * perPage;
        var end = start + perPage - 1;

        const values = Object.values(data);
        const keys = Object.keys(data);

        if (end > keys.length)
            end = keys.length;

        const filtered = {};
        for (var i = start; i <= end; i++) {
            filtered[keys[i]] = values[i];
        }

        // Set properties if a target is specified
        var props = {

            data: filtered, pages: Math.ceil(keys.length / perPage), total: keys.length

        }
        if (target) {
            Object.assign(target, props);
            return target;
        } else {
            return props;
        }
    }

    _pageOptions(params) {
        var p = {};
        if (!params || !params.query || !params.query.page) {
            p.page = 1;
        } else {
            p.page = params.query.page
        }
        if (!params || !params.query || !params.query.perPage) {
            p.perPage = 25;
        } else {
            p.perPage = params.query.perPage;
        }


        return p;
    }

    async getRaw(id) {
        console.log("Task service: getRaw");

        var q = "select id,author,data from tasks where id=" + id;
        var dt = taskdb.prepare(q).all();
        if (dt.length == 0) {
            return [];
        }
        const task = JSON.parse(dt[0].data);
        return task;
    }

    // Return metadata (only) of all tasks
    async find(params) {
        console.log("Task service: find all");
        var q = "select id,author,data from tasks"
        var dt = taskdb.prepare(q).all();
        if (dt.length == 0) {
            return [];
        }
        const tasks = [];
        // console.log(dt);
        
        dt.map((d) => {
            var task = JSON.parse(d.data);
            var t = {id: d.id, title: task.title};
            tasks.push(t)
            console.log(t);
        })
        return tasks;
    }

    async get(id, params) {
        try {
            console.log("Task service: get");
            var q = "select id,author,data from tasks where id=" + id;
            var dt = taskdb.prepare(q).all();
            if (dt.length == 0) {
                return [];
            }
            const { page, perPage } = this._pageOptions(params);

            var orig = dt[0];
            var task = JSON.parse(dt[0].data);
            // const {data, pages, total} = this._paginate(task.data, page, perPage);
            Object.assign(task, {
                page: page,
                perPage: perPage,
                id: orig.id,
                author: orig.author,
                edited: task.edited ? task.edited : {},
                finalized: task.finalized ? task.finalized : {},

            })

            const fields = Object.entries(task.fields);
            // Find the primary key
            var pkField, pkCol;
            for (var i = 0; i < fields.length; i++) {
                // console.log(" ++ " + fields[i][1].type);
                if (fields[i][1].type === "key") {
                    pkField = fields[i][0];
                    pkCol = i;
                }
            }
            console.log("pk name = " + pkField);
            task.pkField = pkField;
            task.pkCol = pkCol;

            if (!params || !params.query) {
                return this._paginate(task.data, page, perPage, task);
            }

            // Filter to proposals that are being edited (i.e. proposal applied)

            const pq = params.query;
            const pEdited = pq.hasOwnProperty("edited") ? pq.edited.toString() : null;
            const pFinalized = pq.hasOwnProperty("finalized") ? pq.finalized.toString() : null;

            if (pEdited || pFinalized) {
                console.log("Edited + finalized filter: " + pEdited + "/" + pFinalized);
                const filtered = {};
                var pks = Object.keys(task.data);
                console.log(pEdited);
                console.log(task.edited);
                console.log(task.finalized);

                pks = pks.filter((key) => {
                    // console.log(task.edited[key] + "/" + pEdited + (task.edited[key] == pEdited.toString() ));
                    return ((pEdited ? (task.edited[key] === pEdited || (pEdited === "false" && !task.edited[key])) : true)
                        && (pFinalized ? (task.finalized[key] === pFinalized[key] || (pFinalized[key] === "false" && !task.finalized[key])) : true))
                });
                console.log(pks);
                pks.forEach((pk) => { filtered[pk] = task.data[pk] })
                // console.log(filtered);
                task.data = filtered;
            }

            if (pq.hasOwnProperty("proposals")) {

                var ps = pq.proposals === "all" ? "all" : pq.proposals.split(",");
                console.log(task.fields);
                task = await this.mergeProposal(task, ps, pkField);
                // console.log(task.data);
            }

            // Filter to items only with proposals
            if (pq.hasOwnProperty("proposedOnly")) {
                console.log("full proposal  ...");
                // console.log(task.proposals);
                const filtered = {};
                const props = Object.keys(task.proposals);
                const dataIds = Object.keys(task.data);
                const intersect = dataIds.filter(value => props.includes(value))

                for (var i = 0; i < intersect.length; i++) {
                    filtered[intersect[i]] = task.data[intersect[i]];
                }
                task.data = filtered;

            }
            console.log("Filtered proposal ...");


            // console.log(task);

            return this._paginate(task.data, page, perPage, task);

        } catch (e) {
            console.log(e);
        }
    }


    async markPending(id, pk) {
        const data = await this.getRaw(id);
        delete data.finalized[pk];
        const q = "update tasks set data=json(@data) where id=@id";
        const stmt = taskdb.prepare(q);
        const t = stmt.run({ data: JSON.stringify(data), id: id })
    }

    async mergeProposal(task, ps, pkField) {
        task.proposals = {};

        if (ps === "all") {
            ps = await new ProposalService().byTaskId(task.id);
        } else {
            for (var i = 0; i < ps.length; i++) {
                var pid = ps[i];
                ps[i] = (await new ProposalService().get(parseInt(pid))).data;
            }
        }

        // Merge with all proposal values 

        const values = {};
        const props = task.proposals;
        for (var i = 0; i < ps.length; i++) {
            const propItems = ps[i].data;

            // iterate thru each proposal
            for (var k = 0; k < propItems.length; k++) {
                const pkVal = propItems[k][pkField];
                if (!task.proposals[pkVal]) {
                    task.proposals[pkVal] = {};
                }
                if (!values[pkVal]) values[pkVal] = {};
                var keys = Object.keys(propItems[k]);
                keys = keys.filter(key => {
                    if (!props[pkVal][key]) {
                        props[pkVal][key] = [];
                    }
                    if (!values[pkVal][key]) values[pkVal][key] = [];
                    console.log(key);
                    return (new ProposalService()._isUnique(props[pkVal][key], propItems[k][key], task.fields[key]))
                })
                keys.forEach((key) => {
                    if (key === pkField)
                        return;
                    props[pkVal][key].push(propItems[k][key]);
                    // values[pkVal][key].push(propItems[k][key])
                })
            }
        }
        console.log(" === Get === with proposals merged ===");
        console.log(JSON.stringify(task.proposals, null, 4));
        console.log(" === end === ");
        return task;


    }

    /* Update line items in a task
       e.g.
       task.data: {
           '35': [
            "張邦奇",
            "1",
            "與余子華",
            "致書Y",
            "余本",
            "128347"
           ]
        }
    */
    async update(id, nData, params) {

        // console.log(task);
        const info = await this.getRaw(id);
        console.log("Task::update ... " + id);

        const q = "update tasks set data=json(@data) where id=@id";
        const stmt = taskdb.prepare(q);

        // Update the original data pkg with new updates
        const pks = Object.keys(nData);

        // Update flags
        //   - edited: all rows that are different from initial value
        //   - finalized: all rows that adopted a certain proposal. 
        //                the flag could be flipped back though.

        if (!info.edited)
            info.edited = {};
        if (!info.finalized)
            info.finalized = {};
        for (var i = 0; i < pks.length; i++) {
            info.data[pks[i]] = nData[pks[i]];
            info.edited[pks[i]] = "true";
            info.finalized[pks[i]] = "true";
        }
        console.log("new data to be upated ... ");
        console.log(info);
        const t = stmt.run({ data: JSON.stringify(info), id: id })
        console.log(t);
        console.log("Task::update done");
    }

    // async find() {
    //     try {
    //         var q = "select data from tasks"
    //         var dt = taskdb.prepare(q).all();
    //         var list = [];
    //         for (var i = 0; i < dt.length; i++)
    //             list.push(JSON.parse(dt[dt.length - 1]["data"]));
    //         return list;
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }
}

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


